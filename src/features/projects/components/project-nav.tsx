'use client';

import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Project } from '../types';
import { PROJECT_STATUS_CONFIG } from '../constants';

interface ProjectNavProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectNav({
  project,
  onEdit,
  onDelete,
}: ProjectNavProps) {
  const status = PROJECT_STATUS_CONFIG[project.status];

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/50 px-3">
      {/* Left — back + title */}
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
