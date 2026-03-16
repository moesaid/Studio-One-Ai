'use client';

import Link from 'next/link';
import { ArrowLeft, Clapperboard, Palette, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Project } from '../types';
import { PROJECT_STATUS_CONFIG } from '../constants';

interface ProjectNavProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onChangeDirector: () => void;
  onChangeStyle: () => void;

}

export function ProjectNav({
  project,
  onEdit,
  onDelete,
  onChangeDirector,
  onChangeStyle,

}: ProjectNavProps) {
  const status = PROJECT_STATUS_CONFIG[project.status];
  const persona = project.director_persona;
  const filmStyle = project.film_style;

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/50 px-3">
      {/* Left — back + title + director + style */}
      <div className="flex items-center gap-2">
        <Link
          href="/studio"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
        <h1 className="text-sm font-semibold tracking-tight text-foreground truncate max-w-[200px]">
          {project.title}
        </h1>
        <Badge
          variant="outline"
          className={`text-[9px] font-medium ${status.bg} ${status.color} border`}
        >
          {status.label}
        </Badge>

        {/* Director persona indicator */}
        {persona && (
          <>
            <div className="h-4 w-px bg-border/60 mx-0.5" />
            <Tooltip>
              <TooltipTrigger
                onClick={onChangeDirector}
                className="group/director inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                <Clapperboard className="h-3 w-3 text-violet-400/70" />
                <span className="truncate max-w-[120px]">{persona.name}</span>
                <Pencil className="h-2.5 w-2.5 opacity-40" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[250px]">
                <p className="font-medium text-xs">{persona.name}</p>
                <p className="text-[10px] text-muted-foreground">{persona.style}</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}

        {/* Film style indicator */}
        {filmStyle && (
          <>
            <div className="h-4 w-px bg-border/60 mx-0.5" />
            <Tooltip>
              <TooltipTrigger
                onClick={onChangeStyle}
                className="group/style inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                <Palette className="h-3 w-3 text-amber-400/70" />
                <span className="truncate max-w-[120px]">{filmStyle.name}</span>
                <Pencil className="h-2.5 w-2.5 opacity-40" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[250px]">
                <p className="font-medium text-xs">{filmStyle.name}</p>
                <p className="text-[10px] text-muted-foreground">{filmStyle.category}</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}

      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1.5">

        <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 text-xs px-2">
          <Pencil className="mr-1.5 h-3 w-3" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-7 text-xs px-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1.5 h-3 w-3" />
          Delete
        </Button>
      </div>
    </div>
  );
}
