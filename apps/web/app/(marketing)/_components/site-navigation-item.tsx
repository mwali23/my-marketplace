'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NavigationMenuItem } from '@kit/ui/navigation-menu';
import { cn, isRouteActive } from '@kit/ui/utils';

export function SiteNavigationItem({
  path,
  children,
}: React.PropsWithChildren<{
  path: string;
}>) {
  const currentPathName = usePathname();
  const isActive = isRouteActive(path, currentPathName);

  return (
    <NavigationMenuItem key={path}>
      <Link
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'text-muted-foreground hover:text-foreground inline-flex w-max items-center gap-2 border-b-2 border-transparent py-2 text-sm font-medium transition-colors',
          {
            'border-primary text-foreground': isActive,
          },
        )}
        href={path}
      >
        {children}
      </Link>
    </NavigationMenuItem>
  );
}
