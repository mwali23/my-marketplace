import Link from 'next/link';

import { ArrowRight, FileSearch, FileUp, Wrench } from 'lucide-react';

import { PageBody, PageHeader } from '@kit/ui/page';

const actions = [
  {
    href: '/marketplace',
    title: 'Find inspection reports',
    description: 'Search by rental property address or unit identifier.',
    Icon: FileSearch,
  },
  {
    href: '/upload',
    title: 'List a report',
    description: 'Add a rights-confirmed PDF to the rental report exchange.',
    Icon: FileUp,
  },
];

export default function HomePage() {
  return (
    <>
      <PageHeader
        title="Workspace"
        description="Rental inspection reports and repair handoffs"
      />

      <PageBody className="pb-10">
        <section className="grid gap-4 md:grid-cols-2">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex min-h-36 items-center gap-4 rounded-md border bg-card p-5 shadow-sm transition-colors hover:border-primary/50 hover:bg-muted/40"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border bg-background text-primary">
                <action.Icon className="h-5 w-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{action.title}</span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  {action.description}
                </span>
              </span>

              <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </section>

        <section className="mt-10 border-t py-8">
          <div className="flex max-w-2xl items-start gap-4">
            <Wrench className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold">Current MVP focus</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                InspectRelay starts with turnover and routine inspection reports
                for small rental portfolios, creating a clean handoff from
                documented findings to repair planning.
              </p>
            </div>
          </div>
        </section>
      </PageBody>
    </>
  );
}
