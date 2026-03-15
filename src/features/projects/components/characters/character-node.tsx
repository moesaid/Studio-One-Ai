'use client';

import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Pencil, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { ROLE_CONFIG } from '@/features/projects/constants/characters';
import type { CharacterNodeData } from '@/features/projects/types';

export function CharacterNode({ data, selected }: NodeProps<Node<CharacterNodeData>>) {
  const ch = data.character;
  const role = ROLE_CONFIG[ch.role] ?? ROLE_CONFIG.other;
  const isRegenerating = data.regeneratingId === ch.id;

  return (
    <div className={`group rounded-2xl border-2 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden w-[300px] ring-1 transition-all duration-150 hover:shadow-black/30 ${selected ? 'border-violet-500 ring-violet-500/40 shadow-violet-500/10' : `border-border/20 ${role.ring}`}`}>
      {/* Handles on all 4 sides for smart routing */}
      <Handle id="right" type="source" position={Position.Right} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle id="left" type="source" position={Position.Left} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle id="top" type="source" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle id="bottom" type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle id="right" type="target" position={Position.Right} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle id="left" type="target" position={Position.Left} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle id="top" type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle id="bottom" type="target" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />

      {/* Accent bar */}
      <div className={`h-1 bg-gradient-to-r ${role.accent}`} />

      {/* Hover actions */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button type="button" onClick={() => data.onEdit(ch)} className="h-6 w-6 flex items-center justify-center rounded-md bg-card/90 border border-border/30 text-muted-foreground hover:text-foreground transition-colors shadow-sm">
          <Pencil className="h-3 w-3" />
        </button>
        <button type="button" onClick={() => data.onRegenerate(ch)} disabled={isRegenerating} className="h-6 w-6 flex items-center justify-center rounded-md bg-card/90 border border-border/30 text-muted-foreground hover:text-violet-400 transition-colors shadow-sm disabled:opacity-40">
          {isRegenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        </button>
        <button type="button" onClick={() => data.onDelete(ch)} className="h-6 w-6 flex items-center justify-center rounded-md bg-card/90 border border-border/30 text-muted-foreground hover:text-red-400 transition-colors shadow-sm">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      <div className="px-4 pt-3.5 pb-4 space-y-2.5">
        {/* Name + role */}
        <div>
          <h3 className="font-bold text-[13px] text-foreground tracking-tight leading-tight">{ch.name}</h3>
          <span className={`text-[9px] font-semibold uppercase tracking-[0.15em] ${role.text}`}>{role.label}</span>
        </div>

        {/* Description */}
        {ch.description && (
          <p className="text-[11px] text-foreground/55 leading-relaxed">{ch.description}</p>
        )}

        {/* Arc */}
        {ch.arc && (
          <div className="space-y-0.5">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Arc</span>
            <p className="text-[10px] text-foreground/50 leading-relaxed italic">{ch.arc}</p>
          </div>
        )}

        {/* Traits */}
        {ch.traits.length > 0 && (
          <div className="space-y-1">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Traits</span>
            <div className="flex flex-wrap gap-1">
              {ch.traits.map((t) => (
                <span key={t} className={`rounded-full border px-2 py-0.5 text-[9px] font-medium ${role.pillBg}`}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Motivations */}
        {ch.motivations.length > 0 && (
          <div className="space-y-1">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Motivations</span>
            <div className="flex flex-wrap gap-1">
              {ch.motivations.map((m) => (
                <span key={m} className="rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-[9px] font-medium text-emerald-300/80">{m}</span>
              ))}
            </div>
          </div>
        )}

        {/* Flaws */}
        {ch.flaws.length > 0 && (
          <div className="space-y-1">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Flaws</span>
            <div className="flex flex-wrap gap-1">
              {ch.flaws.map((f) => (
                <span key={f} className="rounded-full border border-red-500/20 bg-red-500/8 px-2 py-0.5 text-[9px] font-medium text-red-300/70">{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* Voice */}
        {ch.voice && (
          <div className="space-y-0.5">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Voice</span>
            <p className="text-[10px] text-foreground/45 leading-relaxed">{ch.voice}</p>
          </div>
        )}

        {/* Appearance */}
        {ch.appearance && (
          <div className="space-y-0.5">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Appearance</span>
            <p className="text-[10px] text-foreground/40 leading-relaxed line-clamp-2">{ch.appearance}</p>
          </div>
        )}

        {/* Vibe */}
        {ch.vibe && (
          <p className={`text-[10px] italic ${role.text} opacity-60`}>&ldquo;{ch.vibe}&rdquo;</p>
        )}

        {/* Backstory */}
        {ch.backstory && (
          <div className="space-y-0.5">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Backstory</span>
            <p className="text-[10px] text-foreground/35 leading-relaxed line-clamp-3">{ch.backstory}</p>
          </div>
        )}

        {/* Relationships */}
        {ch.relationships && ch.relationships.length > 0 && (
          <div className="space-y-1 pt-0.5">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Relationships</span>
            <div className="space-y-0.5">
              {ch.relationships.map((r, i) => (
                <p key={i} className="text-[10px] text-foreground/40">
                  <span className="text-foreground/60 font-medium">{r.label}</span>{' '}
                  <span className="text-foreground/30">→</span>{' '}
                  <span className="text-foreground/50">{r.target_name}</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
