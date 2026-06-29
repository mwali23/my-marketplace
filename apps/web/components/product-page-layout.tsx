import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { SiteHeader } from '~/(marketing)/_components/site-header';
import { withI18n } from '~/lib/i18n/with-i18n';

async function ProductPageLayout({ children }: React.PropsWithChildren) {
  const client = getSupabaseServerClient();
  const { data } = await client.auth.getClaims();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <SiteHeader user={data?.claims} />

      <main className="flex-1">{children}</main>
    </div>
  );
}

export default withI18n(ProductPageLayout);
