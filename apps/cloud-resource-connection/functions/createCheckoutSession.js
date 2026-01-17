import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@17.4.0';

Deno.serve(async (req) => {
    try {
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
        const base44 = createClientFromRequest(req);

        const { 
            profileId, 
            amount, 
            donorName, 
            donorEmail, 
            donorMessage,
            wishlistItemId,
            latitude,
            longitude
        } = await req.json();

        // Validate amount
        if (!amount || amount < 2) {
            return Response.json({ error: 'Minimum donation amount is $2' }, { status: 400 });
        }

        // Get the profile
        const profiles = await base44.asServiceRole.entities.Profile.filter({ id: profileId });
        if (!profiles || profiles.length === 0) {
            return Response.json({ error: 'Profile not found' }, { status: 404 });
        }

        const profile = profiles[0];

        // Check if profile is active and can receive donations
        if (!profile.isActive || profile.stripeAccountStatus !== 'verified') {
            return Response.json({ 
                error: 'This profile is not currently accepting donations' 
            }, { status: 400 });
        }

        // Calculate fees - Using integer math to avoid floating point issues
        const amountInCents = Math.round(amount * 100);
        const platformFeeInCents = Math.round(amountInCents * 0.01); // 1% platform fee
        const netAmountInCents = amountInCents - platformFeeInCents;

        // Create donation record first
        const donation = await base44.asServiceRole.entities.Donation.create({
            profileId: profileId,
            grossAmount: amountInCents / 100,
            platformFee: platformFeeInCents / 100,
            netAmount: netAmountInCents / 100,
            donorName: donorName || 'Anonymous',
            donorEmail: donorEmail,
            donorMessage: donorMessage || '',
            wishlistItemId: wishlistItemId,
            status: 'pending',
            latitude,
            longitude,
        });

        // Build success and cancel URLs
        const origin = req.headers.get('origin') || 'http://localhost:3000';
        const successUrl = `${origin}/profile/${profile.publicProfileUrl}?success=true`;
        const cancelUrl = `${origin}/profile/${profile.publicProfileUrl}?canceled=true`;

        // Create line item description
        let itemDescription = `Donation to ${profile.publicName}`;
        if (wishlistItemId) {
            const wishlistItems = await base44.asServiceRole.entities.WishlistItem.filter({ id: wishlistItemId });
            if (wishlistItems && wishlistItems.length > 0) {
                itemDescription = `${wishlistItems[0].itemName} for ${profile.publicName}`;
            }
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: itemDescription,
                            description: donorMessage || `Supporting ${profile.publicName}`,
                        },
                        unit_amount: amountInCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            payment_intent_data: {
                application_fee_amount: platformFeeInCents,
                transfer_data: {
                    destination: profile.stripeConnectedAccountId,
                },
                metadata: {
                    donationId: donation.id,
                    profileId: profile.id,
                }
            },
            metadata: {
                donationId: donation.id,
                profileId: profile.id,
            }
        });

        // Update donation with Stripe session ID
        await base44.asServiceRole.entities.Donation.update(donation.id, {
            stripePaymentIntentId: session.payment_intent,
        });

        return Response.json({ 
            sessionId: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('Checkout session creation error:', error);
        return Response.json({ 
            error: 'Failed to create checkout session',
            details: error.message 
        }, { status: 500 });
    }
});