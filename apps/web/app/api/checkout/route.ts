import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  console.log("✅ 1. API Route Hit");
  
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // 1. Safety Check
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is missing from .env.local!");
    }
    console.log("✅ 2. Secret Key Found");

    // 2. Initialize Stripe INSIDE the request (fixes Next.js caching bugs)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' as any, 
    });

    // 3. Parse the data from the frontend
    const body = await req.json();
    const { reportId, price, location } = body;
    console.log(`✅ 3. Data received for: ${location} at $${price}`);

    // 4. Create the secure Checkout Session
    console.log("⏳ 4. Reaching out to Stripe...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Asset Report: ${location}`,
              description: 'Full digital access to the vaulted asset dossier.',
            },
            unit_amount: Math.round(price * 100), 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/marketplace`,
    });

    console.log("✅ 5. Stripe Session Created!");
    return NextResponse.json({ url: session.url });
    
  } catch (err: any) {
    // We return a 400 instead of a 500 so Next.js doesn't overwrite our error with an HTML page!
    console.error("🔥 STRIPE ERROR CAUGHT:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}