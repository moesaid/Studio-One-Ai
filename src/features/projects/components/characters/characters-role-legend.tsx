'use client';

import { Panel } from '@xyflow/react';
import { Separator } from '@/components/ui/separator';
import { ROLE_CONFIG, ROLES } from '@/features/projects/constants/characters';
import type { Character } from '@/features/projects/types';

interface CharactersRoleLegendProps {
  characters: Character[];
}

export function CharactersRoleLegend({ characters }: CharactersRoleLegendProps) {
  return (
    <Panel position="bottom-center" className="!mb-3">
      <div className="flex items-center gap-3 rounded-lg border border-border/20 bg-card/80 backdrop-blur-sm px-3 py-1.5 shadow-md">
        {ROLES.filter((r) => characters.some((c) => c.role === r)).map((r) => (
          <div key={r} className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${ROLE_CONFIG[r].accent}`} />
            <span className="text-[9px] text-muted-foreground/60">{ROLE_CONFIG[r].label}</span>
          </div>
        ))}
        <Separator orientation="vertical" className="h-3 opacity-20" />
        <span className="text-[9px] text-muted-foreground/40">Lines = relationships</span>
      </div>
    </Panel>
  );
}
