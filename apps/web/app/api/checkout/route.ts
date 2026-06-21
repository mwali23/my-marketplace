import { NextResponse } from 'next/server';

import Stripe from 'stripe';
import { z } from 'zod';

import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { Database } from '~/lib/database.types';
import { toStripeAmountCents } from '~/lib/marketplace';

export const runtime = 'nodejs';

const checkoutSchema = z.object({
  reportId: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is missing.');
    }

    const client = getSupabaseServerClient<Database>();
    const userResult = await requireUser(client);

    if (userResult.error) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 },
      );
    }

    const parsed = checkoutSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'A valid report ID is required.' },
        { status: 400 },
      );
    }

    const adminClient = getSupabaseServerAdminClient<Database>();
    const { data: report, error: reportError } = await adminClient
      .from('reports')
      .select(
        `
        id,
        asset_id,
        provider_id,
        price,
        legal_rights_confirmed,
        assets (
          location_identifier
        )
      `,
      )
      .eq('id', parsed.data.reportId)
      .single();

    if (reportError || !report?.legal_rights_confirmed) {
      return NextResponse.json(
        { error: 'Report is not available for purchase.' },
        { status: 404 },
      );
    }

    if (report.provider_id === userResult.data.id) {
      return NextResponse.json(
        { error: 'You already own this report.' },
        { status: 400 },
      );
    }

    const locationIdentifier =
      report.assets?.location_identifier ?? 'Asset Report';
    const amountCents = toStripeAmountCents(report.price);
    const stripe = new Stripe(stripeSecretKey);
    const buyerEmail =
      typeof userResult.data.email === 'string' ? userResult.data.email : undefined;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      client_reference_id: report.id,
      customer_email: buyerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Asset Report: ${locationIdentifier}`,
              description: 'Full digital access to the vaulted asset dossier.',
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        reportId: report.id,
        assetId: report.asset_id,
        providerId: report.provider_id,
        buyerId: userResult.data.id,
      },
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/marketplace`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout failed.';

    console.error('Stripe checkout error:', message);

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
