import { Button } from '@/components/ui/button';
import { Film } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center space-y-6 px-4 text-center">
      <div className="flex items-center gap-3">
        <Film className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">Studio One AI</h1>
      </div>

      <p className="max-w-md text-lg text-muted-foreground">
        Talk to your AI Director. Watch your movie come to life.
      </p>

      <Button size="lg" variant="default">
        Get Started
      </Button>
    </main>
  );
}
