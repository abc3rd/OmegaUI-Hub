import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.4.0';

Deno.serve(async (req) => {
    try {
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (!stripeKey) {
            return Response.json({ 
                error: 'Stripe is not configured. Please contact the administrator.' 
            }, { status: 500 });
        }
        
        const stripe = new Stripe(stripeKey, {
            apiVersion: '2024-12-18.acacia',
        });
        const base44 = createClientFromRequest(req);

        const { 
            profileId, 
            amount, 
            donorName, 
            donorEmail, 
            donorMessage,
            wishlistItemId,
            latitude,
            longitude,
            isRecurring,
            frequency
        } = await req.json();

        // Validate required fields
        if (!profileId) {
            return Response.json({ error: 'Profile ID required' }, { status: 400 });
        }

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

        // Verify connected account exists
        if (!profile.stripeConnectedAccountId) {
            return Response.json({ 
                error: 'Recipient not set up for payments' 
            }, { status: 400 });
        }

        // Check if profile is active and can receive donations
        if (!profile.isActive || profile.isDraft) {
            return Response.json({ 
                error: 'This profile is not currently active' 
            }, { status: 400 });
        }

        if (profile.stripeAccountStatus !== 'verified') {
            return Response.json({ 
                error: 'Recipient has not completed payout setup' 
            }, { status: 400 });
        }

        if (profile.qrCodeStatus === 'disabled') {
            return Response.json({ 
                error: 'This QR code has been disabled' 
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
        const successUrl = `${origin}/profile/${profile.publicProfileUrl}?success=true${isRecurring ? '&recurring=true' : ''}`;
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
        let sessionConfig;
        
        if (isRecurring) {
            // Get authenticated user for recurring donations
            const user = await base44.auth.me();
            if (!user) {
                return Response.json({ error: 'Must be logged in for recurring donations' }, { status: 401 });
            }

            // Create recurring donation record
            const recurringDonation = await base44.asServiceRole.entities.RecurringDonation.create({
                profileId: profileId,
                donorUserId: user.id,
                amount: amountInCents / 100,
                frequency: frequency || 'monthly',
                status: 'incomplete',
                donorName: donorName || user.full_name || 'Anonymous',
                donorEmail: donorEmail || user.email,
            });

            // Create subscription session
            sessionConfig = {
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: itemDescription,
                                description: `Recurring ${frequency || 'monthly'} donation`,
                            },
                            unit_amount: amountInCents,
                            recurring: {
                                interval: frequency === 'yearly' ? 'year' : frequency === 'weekly' ? 'week' : 'month',
                            },
                        },
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: successUrl,
                cancel_url: cancelUrl,
                subscription_data: {
                    application_fee_percent: 1,
                    transfer_data: {
                        destination: profile.stripeConnectedAccountId,
                    },
                    metadata: {
                        recurringDonationId: recurringDonation.id,
                        profileId: profile.id,
                    }
                },
                metadata: {
                    recurringDonationId: recurringDonation.id,
                    profileId: profile.id,
                    frequency: frequency || 'monthly',
                }
            };
        } else {
            // One-time payment session
            sessionConfig = {
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
            };
        }
        
        const session = await stripe.checkout.sessions.create(sessionConfig);

        // Update donation with Stripe IDs (only for one-time donations)
        if (!isRecurring) {
            await base44.asServiceRole.entities.Donation.update(donation.id, {
                stripePaymentIntentId: session.payment_intent,
                stripeCheckoutSessionId: session.id
            });
        }

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