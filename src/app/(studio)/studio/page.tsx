'use client';

import { Button } from '@/components/ui/button';
import { Film, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth';

export default function StudioPage() {
  const { user, signOut } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center space-y-6 px-4 text-center">
      <div className="flex items-center gap-3">
        <Film className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">Studio</h1>
      </div>

      <p className="text-muted-foreground">
        Welcome, <span className="font-medium text-foreground">{user?.displayName}</span>
      </p>

      <Button variant="outline" onClick={signOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </main>
  );
}
