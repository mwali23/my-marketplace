import Link from 'next/link';

import type { LucideIcon } from 'lucide-react';
import { FileSearch, FileUp, Home, Menu } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuList } from '@kit/ui/navigation-menu';

import { SiteNavigationItem } from './site-navigation-item';

const links: Array<{
  label: string;
  path: string;
  Icon: LucideIcon;
}> = [
  {
    label: 'Home',
    path: '/',
    Icon: Home,
  },
  {
    label: 'Find Reports',
    path: '/marketplace',
    Icon: FileSearch,
  },
  {
    label: 'List Report',
    path: '/upload',
    Icon: FileUp,
  },
];

export function SiteNavigation() {
  return (
    <>
      <div className="hidden items-center justify-center md:flex">
        <NavigationMenu className="px-4 py-2">
          <NavigationMenuList className="space-x-5">
            {links.map((item) => (
              <SiteNavigationItem key={item.path} path={item.path}>
                <item.Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </SiteNavigationItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex justify-start sm:items-center md:hidden">
        <MobileDropdown />
      </div>
    </>
  );
}

function MobileDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-52">
        {links.map((item) => (
          <DropdownMenuItem key={item.path} asChild>
            <Link
              className="flex h-10 w-full items-center gap-3"
              href={item.path}
            >
              <item.Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
