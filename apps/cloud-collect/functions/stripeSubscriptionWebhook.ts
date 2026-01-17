import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.4.0';

Deno.serve(async (req) => {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET_SUBSCRIPTIONS');
    
    if (!stripeKey || !endpointSecret) {
        return Response.json({ 
            error: 'Stripe configuration incomplete' 
        }, { status: 500 });
    }
    
    const stripe = new Stripe(stripeKey, {
        apiVersion: '2024-12-18.acacia',
    });
    const base44 = createClientFromRequest(req);
    
    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    try {
        // Verify webhook signature
        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            endpointSecret
        );
        
        console.log(`Subscription webhook received: ${event.type}`);
        
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                
                if (session.mode === 'subscription') {
                    const recurringDonationId = session.metadata.recurringDonationId;
                    const subscriptionId = session.subscription;
                    const customerId = session.customer;
                    
                    if (recurringDonationId) {
                        // Get subscription details
                        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                        
                        // Calculate next donation date
                        const nextDonationDate = new Date(subscription.current_period_end * 1000).toISOString();
                        
                        // Update recurring donation record
                        await base44.asServiceRole.entities.RecurringDonation.update(recurringDonationId, {
                            stripeSubscriptionId: subscriptionId,
                            stripeCustomerId: customerId,
                            status: 'active',
                            nextDonationDate,
                        });
                        
                        console.log(`Recurring donation ${recurringDonationId} activated`);
                    }
                }
                break;
            }
            
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;
                
                if (subscriptionId) {
                    // Find recurring donation by subscription ID
                    const recurringDonations = await base44.asServiceRole.entities.RecurringDonation.filter({
                        stripeSubscriptionId: subscriptionId
                    });
                    
                    if (recurringDonations.length > 0) {
                        const recurringDonation = recurringDonations[0];
                        
                        // Get profile
                        const profiles = await base44.asServiceRole.entities.Profile.filter({ 
                            id: recurringDonation.profileId 
                        });
                        
                        if (profiles.length > 0) {
                            const profile = profiles[0];
                            
                            // Calculate fees
                            const amountInCents = invoice.amount_paid;
                            const platformFeeInCents = Math.round(amountInCents * 0.01);
                            const netAmountInCents = amountInCents - platformFeeInCents;
                            
                            // Create donation record for this payment
                            await base44.asServiceRole.entities.Donation.create({
                                profileId: recurringDonation.profileId,
                                donorUserId: recurringDonation.donorUserId,
                                grossAmount: amountInCents / 100,
                                platformFee: platformFeeInCents / 100,
                                netAmount: netAmountInCents / 100,
                                donorName: recurringDonation.donorName,
                                donorEmail: recurringDonation.donorEmail,
                                donorMessage: `Recurring ${recurringDonation.frequency} donation`,
                                status: 'completed',
                                stripePaymentIntentId: invoice.payment_intent,
                            });
                            
                            // Get subscription to update next donation date
                            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                            const nextDonationDate = new Date(subscription.current_period_end * 1000).toISOString();
                            
                            await base44.asServiceRole.entities.RecurringDonation.update(recurringDonation.id, {
                                nextDonationDate,
                            });
                            
                            console.log(`Payment recorded for recurring donation ${recurringDonation.id}`);
                        }
                    }
                }
                break;
            }
            
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                
                // Find and update recurring donation
                const recurringDonations = await base44.asServiceRole.entities.RecurringDonation.filter({
                    stripeSubscriptionId: subscription.id
                });
                
                if (recurringDonations.length > 0) {
                    await base44.asServiceRole.entities.RecurringDonation.update(recurringDonations[0].id, {
                        status: 'cancelled',
                    });
                    
                    console.log(`Subscription ${subscription.id} cancelled`);
                }
                break;
            }
            
            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                
                // Find and update recurring donation
                const recurringDonations = await base44.asServiceRole.entities.RecurringDonation.filter({
                    stripeSubscriptionId: subscription.id
                });
                
                if (recurringDonations.length > 0) {
                    const nextDonationDate = new Date(subscription.current_period_end * 1000).toISOString();
                    
                    await base44.asServiceRole.entities.RecurringDonation.update(recurringDonations[0].id, {
                        status: subscription.status === 'active' ? 'active' : subscription.status === 'canceled' ? 'cancelled' : subscription.status,
                        nextDonationDate,
                    });
                    
                    console.log(`Subscription ${subscription.id} updated`);
                }
                break;
            }
        }
        
        return Response.json({ received: true });
        
    } catch (error) {
        console.error('Webhook error:', error);
        return Response.json({ error: error.message }, { status: 400 });
    }
});