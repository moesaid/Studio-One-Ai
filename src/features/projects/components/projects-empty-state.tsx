'use client';

import { Film, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectsEmptyStateProps {
  onCreateClick: () => void;
  hasSearch: boolean;
}

export function ProjectsEmptyState({ onCreateClick, hasSearch }: ProjectsEmptyStateProps) {
  if (hasSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-muted-foreground">No projects match your search.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-muted/30">
        <Film className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="mt-5 text-base font-semibold">No projects yet</h3>
      <p className="mt-1.5 max-w-[280px] text-sm text-muted-foreground">
        Create your first film project to start directing with AI.
      </p>
      <Button className="mt-6" onClick={onCreateClick}>
        <Plus className="mr-2 h-4 w-4" />
        Create First Project
      </Button>
    </div>
  );
}
