'use client';

import { ScrollText, Plus, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScriptEmptyStateProps {
  hasChapters: boolean;
  onAddChapter: () => void;
  onGenerateScript: () => void;
}

export function ScriptEmptyState({ hasChapters, onAddChapter, onGenerateScript }: ScriptEmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 ring-1 ring-blue-500/10">
          <ScrollText className="h-6 w-6 text-blue-400/70" strokeWidth={1.5} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-foreground">
            {hasChapters ? 'Select a Chapter' : 'Start Your Script'}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {hasChapters
              ? 'Click on a chapter in the sidebar to view and edit its content.'
              : 'Create your first chapter to begin writing your screenplay, or generate the entire script with AI.'}
          </p>
        </div>
        {!hasChapters && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onAddChapter}>
              <Plus className="mr-2 h-3.5 w-3.5" />
              Add Manually
            </Button>
            <Button
              size="sm"
              onClick={onGenerateScript}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
            >
              <Wand2 className="mr-2 h-3.5 w-3.5" />
              Generate with AI
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
