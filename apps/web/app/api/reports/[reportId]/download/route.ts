import { NextResponse } from 'next/server';

import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { Database } from '~/lib/database.types';
import { REPORTS_BUCKET } from '~/lib/marketplace';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ reportId: string }> },
) {
  const { reportId } = await context.params;
  const client = getSupabaseServerClient<Database>();
  const userResult = await requireUser(client);

  if (userResult.error) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 },
    );
  }

  const adminClient = getSupabaseServerAdminClient<Database>();
  const { data: report, error: reportError } = await adminClient
    .from('reports')
    .select('id, provider_id, file_path')
    .eq('id', reportId)
    .single();

  if (reportError || !report) {
    return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
  }

  const isProvider = report.provider_id === userResult.data.id;

  if (!isProvider) {
    const { data: purchase, error: purchaseError } = await adminClient
      .from('purchases')
      .select('id')
      .eq('report_id', reportId)
      .eq('buyer_id', userResult.data.id)
      .maybeSingle();

    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: 'Report access denied.' },
        { status: 403 },
      );
    }
  }

  const { data: signedUrl, error: signedUrlError } = await adminClient.storage
    .from(REPORTS_BUCKET)
    .createSignedUrl(report.file_path, 60);

  if (signedUrlError || !signedUrl?.signedUrl) {
    return NextResponse.json(
      { error: signedUrlError?.message ?? 'Unable to create report link.' },
      { status: 500 },
    );
  }

  return NextResponse.redirect(signedUrl.signedUrl);
}
