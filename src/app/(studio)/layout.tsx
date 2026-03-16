'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/features/auth';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { StudioSidebar } from '@/components/shared/studio-sidebar';
import { StudioNavbar } from '@/components/shared/studio-navbar';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Only collapse on dynamic project pages (/studio/[id]), not static routes
  const STATIC_ROUTES = ['settings', 'generate', 'library'];
  const segments = pathname.split('/');
  const isProjectPage =
    segments.length === 3 &&
    segments[1] === 'studio' &&
    !!segments[2] &&
    !STATIC_ROUTES.includes(segments[2]);
  const [sidebarOpen, setSidebarOpen] = useState(!isProjectPage);

  // React to route changes — collapse on project pages, expand otherwise
  useEffect(() => {
    setSidebarOpen(!isProjectPage);
  }, [isProjectPage]);

  return (
    <AuthGuard>
      <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <StudioSidebar />
        <SidebarInset>
          <StudioNavbar />
          <div className={`flex-1 overflow-auto ${isProjectPage ? '' : 'container mx-auto'}`}>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
