'use client';

import { Film, Scissors, Play, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EditStep() {
  return (
    <div className="flex h-full flex-col">
      {/* Step header */}
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10">
            <Film className="h-4 w-4 text-sky-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Edit</h2>
            <p className="text-xs text-muted-foreground">Arrange and trim your clips</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Scissors className="mr-2 h-3.5 w-3.5" />
            Split Clip
          </Button>
        </div>
      </div>

      {/* Edit workspace */}
      <div className="flex flex-1 flex-col">
        {/* Preview area */}
        <div className="flex flex-1 items-center justify-center bg-zinc-950/50">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 ring-1 ring-sky-500/10">
              <Film className="h-6 w-6 text-sky-400/70" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-muted-foreground">
              Generate clips first, then arrange them here
            </p>
          </div>
        </div>

        {/* Timeline strip */}
        <div className="shrink-0 border-t border-border/50">
          {/* Transport controls */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground">
                <SkipBack className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground">
                <Play className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground">
                <SkipForward className="h-3.5 w-3.5" />
              </Button>
              <span className="ml-2 text-[10px] font-mono text-muted-foreground/60">
                00:00:00
              </span>
            </div>
          </div>

          {/* Tracks */}
          <div className="space-y-px p-2">
            {['Video', 'Audio', 'Music'].map((track) => (
              <div
                key={track}
                className="flex h-8 items-center rounded border border-border/20 bg-zinc-900/30"
              >
                <div className="flex h-full w-16 shrink-0 items-center border-r border-border/20 px-2">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {track}
                  </span>
                </div>
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
