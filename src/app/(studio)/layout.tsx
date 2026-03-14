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
  const isProjectPage = /^\/studio\/[^/]+$/.test(pathname);
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
