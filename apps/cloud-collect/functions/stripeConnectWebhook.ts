import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.4.0';

Deno.serve(async (req) => {
    try {
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        const webhookSecret = Deno.env.get('STRIPE_CONNECT_WEBHOOK_SECRET');
        
        if (!stripeKey || !webhookSecret) {
            return Response.json({ 
                error: 'Stripe configuration incomplete' 
            }, { status: 500 });
        }
        
        const stripe = new Stripe(stripeKey, {
            apiVersion: '2024-12-18.acacia',
        });
        const base44 = createClientFromRequest(req);
        
        const signature = req.headers.get('stripe-signature');
        const body = await req.text();

        let event;
        try {
            event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return Response.json({ error: 'Invalid signature' }, { status: 400 });
        }

        switch (event.type) {
            case 'account.updated': {
                const account = event.data.object;
                const profiles = await base44.asServiceRole.entities.Profile.filter({
                    stripeConnectedAccountId: account.id
                });

                if (profiles && profiles.length > 0) {
                    const profile = profiles[0];
                    const newStatus = account.charges_enabled 
                        ? 'verified' 
                        : (account.requirements?.currently_due?.length > 0 ? 'pending' : 'rejected');
                    
                    if (profile.stripeAccountStatus !== newStatus) {
                        await base44.asServiceRole.entities.Profile.update(profile.id, {
                            stripeAccountStatus: newStatus
                        });
                    }
                }
                break;
            }

            case 'payout.paid':
            case 'payout.failed':
            case 'payout.canceled': {
                const payout = event.data.object;
                
                const payouts = await base44.asServiceRole.entities.Payout.filter({
                    stripePayoutId: payout.id
                });

                if (payouts && payouts.length > 0) {
                    const statusMap = {
                        'payout.paid': 'paid',
                        'payout.failed': 'failed',
                        'payout.canceled': 'canceled'
                    };

                    const updateData = { status: statusMap[event.type] };
                    if (payout.failure_message) {
                        updateData.failureReason = payout.failure_message;
                    }

                    await base44.asServiceRole.entities.Payout.update(payouts[0].id, updateData);
                }
                break;
            }

            default:
                console.log(`Unhandled Connect event: ${event.type}`);
        }

        return Response.json({ received: true });

    } catch (error) {
        console.error('Connect webhook error:', error);
        return Response.json({ 
            error: 'Webhook processing failed',
            details: error.message 
        }, { status: 500 });
    }
});