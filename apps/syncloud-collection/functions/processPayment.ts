import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const PLATFORM_FEE_PERCENTAGE = 0.08; // 8% platform fee

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { jobId, workerId, amount, paymentMethodId } = await req.json();

        if (!jobId || !workerId || !amount || !paymentMethodId) {
            return new Response(JSON.stringify({ 
                error: 'Missing required parameters: jobId, workerId, amount, paymentMethodId' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get job and worker details
        const [job, worker] = await Promise.all([
            base44.entities.JobPosting.get(jobId),
            base44.entities.WorkerProfile.get(workerId)
        ]);

        if (!job || !worker) {
            return new Response(JSON.stringify({ error: 'Job or worker not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Calculate platform fee
        const platformFee = amount * PLATFORM_FEE_PERCENTAGE;
        const workerAmount = amount - platformFee;

        // Create payment intent with Stripe
        const paymentResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                amount: Math.round(amount * 100), // Amount in cents
                currency: 'usd',
                payment_method: paymentMethodId,
                confirm: 'true',
                description: `Payment for job: ${job.title}`,
                metadata: JSON.stringify({
                    job_id: jobId,
                    worker_id: workerId,
                    employer_email: user.email
                }),
                application_fee_amount: Math.round(platformFee * 100), // Platform fee in cents
                transfer_data: worker.stripe_account_id ? {
                    destination: worker.stripe_account_id,
                    amount: Math.round(workerAmount * 100)
                } : undefined
            })
        });

        const paymentResult = await paymentResponse.json();

        if (!paymentResponse.ok) {
            throw new Error(paymentResult.error?.message || 'Payment failed');
        }

        // Create payment transaction record
        const transaction = await base44.asServiceRole.entities.PaymentTransaction.create({
            job_posting_id: jobId,
            worker_profile_id: workerId,
            employer_email: user.email,
            worker_email: worker.created_by, // Assuming worker entity has created_by field
            amount: amount,
            platform_fee: platformFee,
            worker_net_amount: workerAmount,
            stripe_payment_intent_id: paymentResult.id,
            payment_status: paymentResult.status === 'succeeded' ? 'completed' : 'processing',
            payment_date: new Date().toISOString()
        });

        // Update job status if payment successful
        if (paymentResult.status === 'succeeded') {
            await base44.entities.JobPosting.update(jobId, {
                status: 'filled',
                assigned_worker_id: workerId,
                stripe_payment_intent_id: paymentResult.id
            });

            // Update worker as no longer available for this specific time
            // Note: In a real implementation, you'd want more sophisticated scheduling
            await base44.entities.WorkerProfile.update(workerId, {
                completed_jobs: (worker.completed_jobs || 0) + 1
            });
        }

        return new Response(JSON.stringify({
            success: true,
            payment_intent_id: paymentResult.id,
            status: paymentResult.status,
            transaction_id: transaction.id,
            platform_fee: platformFee,
            worker_amount: workerAmount
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Payment processing error:', error);
        return new Response(JSON.stringify({ 
            error: error.message,
            details: 'Payment processing failed'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});