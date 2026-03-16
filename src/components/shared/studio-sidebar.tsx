'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderOpen, Settings, LayoutDashboard } from 'lucide-react';
import { StudioOneLogo } from '@/components/shared/icons';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/features/auth';

const mainNavItems = [
  { label: 'Projects', href: '/studio', icon: FolderOpen },
];

const bottomNavItems = [
  { label: 'Settings', href: '/studio/settings', icon: Settings },
];

export function StudioSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Logo */}
      <SidebarHeader className="p-4">
        <Link href="/studio" className="flex items-center gap-2.5">
          <StudioOneLogo size={28} />
          <span className="truncate text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Studio One AI
          </span>
        </Link>
      </SidebarHeader>

      {/* Main nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                isActive={pathname === item.href}
                tooltip={item.label}
                render={<Link href={item.href} />}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          {/* User avatar */}
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={user.displayName ?? 'Account'}>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    className="h-5 w-5 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <LayoutDashboard />
                )}
                <span className="truncate text-xs">{user.displayName}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  );
}
