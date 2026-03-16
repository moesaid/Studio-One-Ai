'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/features/auth';

export function StudioNavbar() {
  const { signOut } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/50 px-4">
      <SidebarTrigger className="-ml-1" variant="outline" />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side */}
      <Button
        variant="ghost"
        size="sm"
        onClick={signOut}
        className="text-muted-foreground hover:text-foreground"
      >
        <LogOut className="mr-2 h-3.5 w-3.5" />
        Sign out
      </Button>
    </header>
  );
}
