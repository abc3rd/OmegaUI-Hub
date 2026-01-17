import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.4.0';

async function sendDonationReceipt(base44, donation) {
    if (!donation.donorEmail) {
        console.log(`No email for donation ${donation.id}, skipping receipt.`);
        return;
    }

    const profiles = await base44.asServiceRole.entities.Profile.filter({ id: donation.profileId });
    if (!profiles || profiles.length === 0) return;
    const profile = profiles[0];

    const emailBody = `
        <div style="font-family: sans-serif; line-height: 1.6;">
            <h1 style="color: #333;">Thank you for your donation!</h1>
            <p>Hello ${donation.donorName || 'Donor'},</p>
            <p>Thank you for your generous donation of <strong>$${donation.grossAmount.toFixed(2)}</strong> to <strong>${profile.publicName}</strong> through Cloud Collect.</p>
            <p>Your contribution makes a real difference. Here are the details of your transaction:</p>
            <ul style="list-style-type: none; padding: 0;">
                <li style="margin-bottom: 8px;"><strong>Recipient:</strong> ${profile.publicName}</li>
                <li style="margin-bottom: 8px;"><strong>Donation Amount:</strong> $${donation.grossAmount.toFixed(2)}</li>
                <li style="margin-bottom: 8px;"><strong>Date:</strong> ${new Date(donation.created_date).toLocaleDateString()}</li>
                <li style="margin-bottom: 8px;"><strong>Transaction ID:</strong> ${donation.id}</li>
            </ul>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 0.9em; color: #555;">
                <strong>For Your Records:</strong><br />
                This is a receipt for your peer-to-peer payment through Cloud Collect. Please consult with your tax advisor to determine if this contribution qualifies for any tax benefits in your jurisdiction.
            </p>
            <p>Thank you again for your support!</p>
            <p><em>- The Cloud Collect Team</em></p>
        </div>
    `;

    try {
        await base44.asServiceRole.integrations.Core.SendEmail({
            to: donation.donorEmail,
            subject: `Your Cloud Collect Payment Receipt - ${profile.publicName}`,
            body: emailBody
        });
        console.log(`Receipt sent for donation ${donation.id}`);
    } catch (e) {
        console.error(`Failed to send receipt for donation ${donation.id}:`, e);
    }
}

Deno.serve(async (req) => {
    try {
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
        
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
            case 'checkout.session.completed': {
                const session = event.data.object;
                const donationId = session.metadata?.donationId;

                if (!donationId) {
                    console.error('No donationId in session metadata');
                    break;
                }

                const donations = await base44.asServiceRole.entities.Donation.filter({
                    id: donationId
                });

                if (donations && donations.length > 0) {
                    const donation = donations[0];
                    
                    if (donation.status === 'completed') {
                        console.log(`Donation ${donation.id} already processed`);
                        break;
                    }

                    // Update donation with full Stripe details
                    await base44.asServiceRole.entities.Donation.update(donation.id, {
                        status: 'completed',
                        stripePaymentIntentId: session.payment_intent,
                        stripeCheckoutSessionId: session.id
                    });

                    // Update profile totals
                    const profiles = await base44.asServiceRole.entities.Profile.filter({
                        id: donation.profileId
                    });

                    if (profiles && profiles.length > 0) {
                        const profile = profiles[0];
                        await base44.asServiceRole.entities.Profile.update(profile.id, {
                            totalRaised: (profile.totalRaised || 0) + donation.grossAmount,
                            pendingBalance: (profile.pendingBalance || 0) + donation.netAmount
                        });
                    }

                    // Update wishlist item if applicable
                    if (donation.wishlistItemId) {
                        const items = await base44.asServiceRole.entities.WishlistItem.filter({ 
                            id: donation.wishlistItemId 
                        });
                        if (items.length > 0) {
                            await base44.asServiceRole.entities.WishlistItem.update(donation.wishlistItemId, {
                                status: 'funded'
                            });
                        }
                    }

                    // Send receipt
                    await sendDonationReceipt(base44, donation);
                }
                break;
            }

            case 'checkout.session.expired':
            case 'payment_intent.payment_failed': {
                const session = event.data.object;
                const donationId = session.metadata?.donationId || session.id;
                
                const donations = await base44.asServiceRole.entities.Donation.filter({
                    id: donationId
                });

                if (donations && donations.length > 0) {
                    await base44.asServiceRole.entities.Donation.update(donations[0].id, {
                        status: 'failed'
                    });
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return Response.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return Response.json({ 
            error: 'Webhook processing failed',
            details: error.message 
        }, { status: 500 });
    }
});