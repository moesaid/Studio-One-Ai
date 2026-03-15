'use client';

import { Panel } from '@xyflow/react';
import { ImageIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ROLE_CONFIG } from '@/features/projects/constants/characters';
import type { Character } from '@/features/projects/types';

interface CharactersQuickNavProps {
  characters: Character[];
  onNavigate: (nodeId: string) => void;
}

export function CharactersQuickNav({ characters, onNavigate }: CharactersQuickNavProps) {
  return (
    <Panel position="top-left" className="!ml-3 !mt-[60px] mt-18!">
      <div className="rounded-xl border border-border/30 bg-card/90 backdrop-blur-md shadow-lg shadow-black/10 w-[200px] max-h-[calc(100vh-220px)] overflow-hidden flex flex-col">
        <div className="px-3 py-2 border-b border-border/20">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Quick Navigate</span>
        </div>
        <ScrollArea className="flex-1">
          <div className="py-1">
            {characters.map((ch) => {
              const role = ROLE_CONFIG[ch.role] ?? ROLE_CONFIG.other;
              const nodeId = `char-${ch.id}`;
              const hasImages = ch.reference_images && ch.reference_images.length > 0;
              return (
                <button
                  key={ch.id}
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => onNavigate(nodeId)}
                >
                  <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${role.accent} flex-shrink-0`} />
                  <span className="text-[11px] text-foreground/80 truncate">{ch.name}</span>
                  <Tooltip>
                    <TooltipTrigger className="ml-auto flex-shrink-0">
                        {hasImages ? (
                          <ImageIcon className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <ImageIcon className="h-3 w-3 text-muted-foreground/30" />
                        )}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-[10px]">
                      {hasImages
                        ? `${ch.reference_images.length} reference image${ch.reference_images.length > 1 ? 's' : ''}`
                        : 'No reference images'}
                    </TooltipContent>
                  </Tooltip>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </Panel>
  );
}
