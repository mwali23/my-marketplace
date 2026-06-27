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
            <div className="text-muted-foreground mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
              Inspection findings that lead to action
            </div>

            <h1 className="text-foreground text-4xl font-bold tracking-normal sm:text-5xl lg:text-6xl">
              Inspection Report Marketplace
            </h1>

            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-8">
              Find and share inspection documents tied to real properties,
              sites, and records. Turn identified issues into a clear path
              toward qualified repair and remediation services.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/marketplace"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-medium shadow"
              >
                Browse Marketplace
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/upload"
                className="hover:bg-muted inline-flex items-center justify-center gap-2 rounded-md border px-5 py-3 text-sm font-medium shadow-sm"
              >
                Upload a Report
              </Link>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4 shadow-sm">
            <div className="bg-background rounded-md border p-4">
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <div>
                  <p className="text-sm font-medium">Inspection marketplace</p>
                  <p className="text-muted-foreground text-xs">
                    Searchable documents with secure access
                  </p>
                </div>
                <LockKeyhole className="h-5 w-5 text-emerald-500" />
              </div>

              <div className="space-y-3">
                {[
                  [
                    'Home Inspection Report',
                    'Residential safety findings',
                    '$45',
                  ],
                  [
                    'Fire Safety Inspection',
                    'Commercial compliance review',
                    '$60',
                  ],
                  [
                    'Roof Inspection Report',
                    'Repair-ready condition findings',
                    '$75',
                  ],
                ].map(([title, description, price]) => (
                  <div
                    key={title}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border p-3"
                  >
                    <FileSearch className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="text-muted-foreground text-xs">
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
            title="List"
            description="Inspectors and document owners list rights-confirmed PDF reports with secure file storage."
          />
          <Step
            icon={<FileSearch className="h-5 w-5" />}
            title="Discover"
            description="Buyers search by property, site, or record identifier to find relevant inspection documents."
          />
          <Step
            icon={<LockKeyhole className="h-5 w-5" />}
            title="Unlock"
            description="Secure checkout unlocks the report and creates a path from each finding to the right service provider."
          />
        </div>
      </section>
    </div>
  );
}

export default withI18n(Home);

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-md p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
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
    <div className="bg-card rounded-lg border p-5 shadow-sm">
      <div className="text-primary mb-4 inline-flex rounded-md border p-2">
        {icon}
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        {description}
      </p>
    </div>
  );
}
