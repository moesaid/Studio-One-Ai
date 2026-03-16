'use client';

import { Clapperboard, Plus, Sparkles, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ScenesToolbarProps {
  sceneCount: number;
  hasChapters: boolean;
  extractLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExtract: () => void;
  onAdd: () => void;
}

export function ScenesToolbar({
  sceneCount,
  hasChapters,
  extractLoading,
  searchQuery,
  onSearchChange,
  onExtract,
  onAdd,
}: ScenesToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
          <Clapperboard className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Scenes</h2>
          <p className="text-xs text-muted-foreground">
            {sceneCount} {sceneCount === 1 ? 'scene' : 'scenes'} · Break your story into visual scenes
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {sceneCount > 0 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <Input
              placeholder="Search scenes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 w-44 pl-8 text-xs"
            />
          </div>
        )}
        {hasChapters && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={onExtract}
            disabled={extractLoading}
          >
            {extractLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Auto-Split
          </Button>
        )}
        <Button size="sm" className="h-8 text-xs gap-1.5" onClick={onAdd}>
          <Plus className="h-3 w-3" /> Add Scene
        </Button>
      </div>
    </div>
  );
}
