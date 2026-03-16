'use client';

import { Users, Plus, Sparkles, Loader2, LayoutGrid } from 'lucide-react';
import { Panel } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface CharactersToolbarProps {
  characterCount: number;
  hasChapters: boolean;
  extractLoading: boolean;
  onExtract: () => void;
  onAdd: () => void;
  onReorganize: () => void;
}

export function CharactersToolbar({
  characterCount,
  hasChapters,
  extractLoading,
  onExtract,
  onAdd,
  onReorganize,
}: CharactersToolbarProps) {
  return (
    <Panel position="top-left" className="!m-3">
      <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-card/90 backdrop-blur-md px-4 py-2.5 shadow-lg shadow-black/10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
            <Users className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-foreground leading-tight">Character Bible</h2>
            <p className="text-[10px] text-muted-foreground">{characterCount} character{characterCount !== 1 ? 's' : ''} · double-click to edit</p>
          </div>
        </div>
        <Separator orientation="vertical" className="h-6 opacity-20" />
        {hasChapters && (
          <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 text-muted-foreground hover:text-foreground" onClick={onExtract} disabled={extractLoading}>
            {extractLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            {extractLoading ? 'Extracting...' : 'Extract from Script'}
          </Button>
        )}
        <Button size="sm" className="h-7 text-[11px] gap-1.5" onClick={onAdd}>
          <Plus className="h-3 w-3" /> Add
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 text-muted-foreground hover:text-foreground" onClick={onReorganize}>
          <LayoutGrid className="h-3 w-3" /> Reorganize
        </Button>
      </div>
    </Panel>
  );
}
