import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, description, customerName, customerEmail, leadId } = await req.json();
    
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return Response.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      description: description,
      metadata: {
        customer_name: customerName || 'Unknown',
        customer_email: customerEmail || '',
        lead_id: leadId || ''
      }
    });

    // Create transaction record
    await base44.entities.Transaction.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      description: description,
      customer_name: customerName,
      customer_email: customerEmail,
      payment_method: 'card',
      status: 'pending',
      stripe_payment_intent_id: paymentIntent.id,
      lead_id: leadId
    });

    return Response.json({ 
      success: true, 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
    
  } catch (error) {
    console.error('Stripe payment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});