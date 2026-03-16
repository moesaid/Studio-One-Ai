'use client';

import { Film, Sparkles } from 'lucide-react';
import type { EditStepProps } from '../../types';

export function EditStep({ project_id }: EditStepProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 ring-1 ring-sky-500/10">
          <Film className="h-9 w-9 text-sky-400/70" strokeWidth={1.5} />
        </div>
        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Timeline Editor
        </h2>
        <p className="text-sm text-muted-foreground">Coming Soon</p>
        <p className="max-w-xs text-xs text-muted-foreground/60">
          Arrange, trim, and combine your generated clips into a polished final video
        </p>
      </div>
    </div>
  );
}
