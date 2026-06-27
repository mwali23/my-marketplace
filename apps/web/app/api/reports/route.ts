import { NextResponse } from 'next/server';

import { z } from 'zod';

import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { Database } from '~/lib/database.types';
import {
  MAX_REPORT_FILE_SIZE,
  type MarketplaceReport,
  REPORTS_BUCKET,
  toPriceNumber,
} from '~/lib/marketplace';

export const runtime = 'nodejs';

const reportUploadSchema = z.object({
  locationIdentifier: z.string().trim().min(2).max(500),
  price: z.coerce.number().positive().max(100_000),
  legalRightsConfirmed: z.coerce.boolean().refine(Boolean, {
    message: 'You must confirm legal rights before uploading.',
  }),
});

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const query = searchParams.get('query')?.trim() ?? '';
  const adminClient = getSupabaseServerAdminClient<Database>();

  const assetsQuery = adminClient
    .from('assets')
    .select('id, location_identifier')
    .order('created_at', { ascending: false })
    .limit(query ? 50 : 100);

  const { data: assets, error: assetsError } = query
    ? await assetsQuery.ilike('location_identifier', `%${query}%`)
    : await assetsQuery;

  if (assetsError) {
    return NextResponse.json({ error: assetsError.message }, { status: 500 });
  }

  if (!assets?.length) {
    return NextResponse.json({ reports: [] satisfies MarketplaceReport[] });
  }

  const assetById = new Map(
    assets.map((asset) => [asset.id, asset.location_identifier]),
  );

  const { data: reports, error: reportsError } = await adminClient
    .from('reports')
    .select('id, asset_id, price, created_at')
    .eq('legal_rights_confirmed', true)
    .in('asset_id', [...assetById.keys()])
    .order('created_at', { ascending: false })
    .limit(25);

  if (reportsError) {
    return NextResponse.json({ error: reportsError.message }, { status: 500 });
  }

  const marketplaceReports: MarketplaceReport[] = (reports ?? []).map(
    (report) => ({
      id: report.id,
      locationIdentifier: assetById.get(report.asset_id) ?? 'Unknown location',
      price: toPriceNumber(report.price),
      createdAt: report.created_at,
      category: 'Inspection Report',
    }),
  );

  return NextResponse.json({ reports: marketplaceReports });
}

export async function POST(request: Request) {
  const client = getSupabaseServerClient<Database>();
  const userResult = await requireUser(client);

  if (userResult.error) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  const parsed = reportUploadSchema.safeParse({
    locationIdentifier: formData.get('locationIdentifier'),
    price: formData.get('price'),
    legalRightsConfirmed: formData.get('legalRightsConfirmed'),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid upload.' },
      { status: 400 },
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'A PDF file is required.' },
      { status: 400 },
    );
  }

  if (file.size > MAX_REPORT_FILE_SIZE) {
    return NextResponse.json(
      { error: 'PDF must be 10MB or smaller.' },
      { status: 400 },
    );
  }

  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    return NextResponse.json(
      { error: 'Only PDF uploads are supported.' },
      { status: 400 },
    );
  }

  const user = userResult.data;
  const adminClient = getSupabaseServerAdminClient<Database>();
  const filePath = `${user.id}/${crypto.randomUUID()}.pdf`;

  const { error: uploadError } = await adminClient.storage
    .from(REPORTS_BUCKET)
    .upload(filePath, file, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: asset, error: assetError } = await adminClient
    .from('assets')
    .insert({
      owner_id: user.id,
      location_identifier: parsed.data.locationIdentifier,
    })
    .select('id, location_identifier')
    .single();

  if (assetError) {
    await adminClient.storage.from(REPORTS_BUCKET).remove([filePath]);

    return NextResponse.json({ error: assetError.message }, { status: 500 });
  }

  const { data: report, error: reportError } = await adminClient
    .from('reports')
    .insert({
      asset_id: asset.id,
      provider_id: user.id,
      price: parsed.data.price,
      file_path: filePath,
      legal_rights_confirmed: true,
    })
    .select('id, price, created_at')
    .single();

  if (reportError) {
    await adminClient.storage.from(REPORTS_BUCKET).remove([filePath]);
    await adminClient.from('assets').delete().eq('id', asset.id);

    return NextResponse.json({ error: reportError.message }, { status: 500 });
  }

  return NextResponse.json({
    report: {
      id: report.id,
      locationIdentifier: asset.location_identifier,
      price: toPriceNumber(report.price),
      createdAt: report.created_at,
      category: 'Inspection Report',
    } satisfies MarketplaceReport,
  });
}
