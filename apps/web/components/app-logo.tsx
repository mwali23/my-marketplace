import Link from 'next/link';

import { cn } from '@kit/ui/utils';

function LogoImage({ className }: { className?: string; width?: number }) {
  return (
    <span
      className={cn(
        'text-foreground inline-flex items-center gap-2 text-base font-semibold tracking-normal whitespace-nowrap',
        className,
      )}
    >
      <span className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold">
        IR
      </span>
      <span className="hidden sm:inline">InspectRelay</span>
    </span>
  );
}

export function AppLogo({
  href,
  label,
  className,
}: {
  href?: string | null;
  className?: string;
  label?: string;
}) {
  if (href === null) {
    return <LogoImage className={className} />;
  }

  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'}>
      <LogoImage className={className} />
    </Link>
  );
}
