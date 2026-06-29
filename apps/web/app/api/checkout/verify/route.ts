import { NextResponse } from 'next/server';

import Stripe from 'stripe';

import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { Database } from '~/lib/database.types';
import { toPriceNumber } from '~/lib/marketplace';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get('session_id');
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing checkout session.' },
      { status: 400 },
    );
  }

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: 'Stripe is not configured.' },
      { status: 500 },
    );
  }

  const client = getSupabaseServerClient<Database>();
  const userResult = await requireUser(client);

  if (userResult.error) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 },
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const reportId = session.metadata?.reportId;
  const buyerId = session.metadata?.buyerId;

  if (
    session.payment_status !== 'paid' ||
    !reportId ||
    buyerId !== userResult.data.id
  ) {
    return NextResponse.json(
      { error: 'Payment could not be verified.' },
      { status: 402 },
    );
  }

  const adminClient = getSupabaseServerAdminClient<Database>();
  const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

  const { error: purchaseError } = await adminClient.from('purchases').upsert(
    {
      report_id: reportId,
      buyer_id: userResult.data.id,
      stripe_checkout_session_id: session.id,
      amount_paid: amountPaid,
    },
    {
      onConflict: 'stripe_checkout_session_id',
    },
  );

  if (purchaseError) {
    return NextResponse.json({ error: purchaseError.message }, { status: 500 });
  }

  const { data: report, error: reportError } = await adminClient
    .from('reports')
    .select(
      `
      id,
      price,
      assets (
        location_identifier
      )
    `,
    )
    .eq('id', reportId)
    .single();

  if (reportError || !report) {
    return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
  }

  return NextResponse.json({
    report: {
      id: report.id,
      locationIdentifier:
        report.assets?.location_identifier ?? 'Purchased Rental Inspection Report',
      price: toPriceNumber(report.price),
      downloadUrl: `/api/reports/${report.id}/download`,
    },
  });
}
