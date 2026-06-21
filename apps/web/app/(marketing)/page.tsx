import Link from 'next/link';

import {
  ArrowRight,
  BadgeCheck,
  FileSearch,
  LockKeyhole,
  UploadCloud,
} from 'lucide-react';

import { withI18n } from '~/lib/i18n/with-i18n';

function Home() {
  return (
    <div className="bg-background">
      <section className="border-b">
        <div className="container mx-auto grid min-h-[calc(100vh-4rem)] items-center gap-10 px-4 py-10 lg:grid-cols-[1fr_0.9fr]">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
              Verified digital dossiers for high-value assets
            </div>

            <h1 className="text-4xl font-bold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
              Asset Report Marketplace
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Buy and sell vaulted PDF reports tied to real asset identifiers.
              Providers upload verified dossiers, buyers search by location or
              asset ID, and checkout unlocks secure access.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
              >
                Browse Marketplace
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/upload"
                className="inline-flex items-center justify-center gap-2 rounded-md border px-5 py-3 text-sm font-medium shadow-sm hover:bg-muted"
              >
                Upload a Report
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="rounded-md border bg-background p-4">
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <div>
                  <p className="text-sm font-medium">Live report vault</p>
                  <p className="text-xs text-muted-foreground">
                    Searchable, priced, and permissioned
                  </p>
                </div>
                <LockKeyhole className="h-5 w-5 text-emerald-500" />
              </div>

              <div className="space-y-3">
                {[
                  ['Site Diligence Packet', 'Nashville parcel corridor', '$45'],
                  ['Counter-UAS Brief', 'Restricted airspace review', '$120'],
                  ['Asset Visual Dossier', 'Industrial roof inspection', '$75'],
                ].map(([title, description, price]) => (
                  <div
                    key={title}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border p-3"
                  >
                    <FileSearch className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="text-xs text-muted-foreground">
                        {description}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">{price}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Metric label="Reports" value="3" />
                <Metric label="Access" value="Private" />
                <Metric label="Files" value="PDF" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="container mx-auto grid gap-4 px-4 py-12 md:grid-cols-3">
          <Step
            icon={<UploadCloud className="h-5 w-5" />}
            title="Vault"
            description="Providers upload rights-confirmed PDF reports into private Supabase storage."
          />
          <Step
            icon={<FileSearch className="h-5 w-5" />}
            title="Discover"
            description="Buyers search by asset location or identifier and see trusted report listings."
          />
          <Step
            icon={<LockKeyhole className="h-5 w-5" />}
            title="Unlock"
            description="Stripe verifies payment before the app creates purchase access and a signed file link."
          />
        </div>
      </section>
    </div>
  );
}

export default withI18n(Home);

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function Step({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="mb-4 inline-flex rounded-md border p-2 text-primary">
        {icon}
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
