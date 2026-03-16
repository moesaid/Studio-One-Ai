'use client';

import { Clapperboard, Layers, Plus, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SceneExtractDialog } from './scene-extract-dialog';

interface ScenesEmptyStateProps {
  hasChapters: boolean;
  extractLoading: boolean;
  extractStep: number;
  onExtract: () => void;
  onAdd: () => void;
}

export function ScenesEmptyState({
  hasChapters,
  extractLoading,
  extractStep,
  onExtract,
  onAdd,
}: ScenesEmptyStateProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
            <Clapperboard className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Scenes</h2>
            <p className="text-[11px] text-muted-foreground">0 scenes</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 ring-1 ring-amber-500/10">
            <Layers className="h-7 w-7 text-amber-400/60" strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-foreground">No Scenes Yet</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {hasChapters
                ? 'Split your script into scenes using AI, or add them manually. Each scene captures a specific location, time, and dramatic beat.'
                : 'Write your script first, then split it into scenes automatically with AI.'}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {hasChapters && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={onExtract}
                disabled={extractLoading}
              >
                {extractLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                Auto-Split from Script
              </Button>
            )}
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={onAdd}>
              <Plus className="h-3 w-3" /> Add Manually
            </Button>
          </div>
        </div>
      </div>
      <SceneExtractDialog open={extractLoading} currentStep={extractStep} />
    </div>
  );
}
