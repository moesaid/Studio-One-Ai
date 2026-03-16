'use client';

import { Film } from 'lucide-react';
import type { EditStepProps } from '../../types';

/* ── Edit Step — Placeholder ── */

export function EditStep({ project_id }: EditStepProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border/50 px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10">
          <Film className="h-4 w-4 text-sky-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Edit</h2>
          <p className="text-xs text-muted-foreground">Arrange and combine your clips</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 ring-1 ring-sky-500/10">
            <Film className="h-6 w-6 text-sky-400/70" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-muted-foreground">Video editor coming soon</p>
        </div>
      </div>
    </div>
  );
}
