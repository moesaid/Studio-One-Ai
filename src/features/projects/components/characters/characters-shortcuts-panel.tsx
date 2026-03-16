'use client';

import { Keyboard, X } from 'lucide-react';
import { Panel } from '@xyflow/react';
import { KEYBOARD_SHORTCUTS } from '@/features/projects/constants/characters';

interface CharactersShortcutsPanelProps {
  showHelp: boolean;
  onToggleHelp: () => void;
}

export function CharactersShortcutsPanel({ showHelp, onToggleHelp }: CharactersShortcutsPanelProps) {
  return (
    <>
      <Panel position="top-right" className="!m-3">
        <button
          type="button"
          onClick={onToggleHelp}
          className="flex items-center gap-1.5 rounded-lg border border-border/20 bg-card/80 backdrop-blur-sm px-2.5 py-1.5 shadow-md text-muted-foreground hover:text-foreground transition-colors"
        >
          <Keyboard className="h-3 w-3" />
          <span className="text-[10px]">Shortcuts</span>
        </button>
      </Panel>

      {showHelp && (
        <Panel position="top-right" className="!m-3 !mt-12">
          <div className="rounded-xl border border-border/30 bg-card/95 backdrop-blur-xl px-5 py-4 shadow-2xl shadow-black/20 w-[240px] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-foreground">Keyboard Shortcuts</h3>
              <button type="button" onClick={onToggleHelp} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
            </div>
            <div className="space-y-1.5">
              {KEYBOARD_SHORTCUTS.map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{desc}</span>
                  <kbd className="rounded border border-border/30 bg-muted/40 px-1.5 py-0.5 text-[9px] font-mono text-foreground/60">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}
    </>
  );
}
