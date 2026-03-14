'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MoreHorizontal, Pencil, Trash2, Film } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Project } from '../types';
import { PROJECT_STATUS_CONFIG } from '../constants';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  formatDate: (date: string) => string;
}

export function ProjectCard({ project, onEdit, onDelete, formatDate }: ProjectCardProps) {
  const status = PROJECT_STATUS_CONFIG[project.status];

  return (
    <Card className="group relative overflow-hidden py-0 transition-all duration-300 hover:border-white/10 hover:shadow-lg hover:shadow-amber-500/[0.03]">
      {/* Clickable area — thumbnail + content */}
      <Link href={`/studio/${project.id}`} className="block">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden">
          {project.thumbnail_url ? (
            <Image
              src={project.thumbnail_url}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800/80 to-zinc-900 transition-all duration-500 group-hover:from-zinc-800 group-hover:via-zinc-700/60 group-hover:to-zinc-800">
              <div className="flex flex-col items-center gap-2 opacity-30 transition-opacity duration-500 group-hover:opacity-50">
                <Film className="h-8 w-8 text-amber-400/70" strokeWidth={1.2} />
                <span className="text-[10px] font-medium uppercase tracking-widest text-amber-400/50">
                  No preview
                </span>
              </div>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <Link href={`/studio/${project.id}`} className="flex-1 space-y-1">
            <h3 className="text-base font-semibold leading-tight text-foreground hover:underline">
              {project.title}
            </h3>
            <Badge
              variant="outline"
              className={`text-[10px] font-medium ${status.bg} ${status.color} border`}
            >
              {status.label}
            </Badge>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(project)}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(project)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        {/* Footer */}
        <div className="mt-3 flex items-center gap-3 border-t border-border/50 pt-3">
          <span className="text-[11px] text-muted-foreground">
            Created {formatDate(project.created_at)}
          </span>
          {project.created_at !== project.updated_at && (
            <>
              <span className="text-[11px] text-muted-foreground/50">·</span>
              <span className="text-[11px] text-muted-foreground">
                Updated {formatDate(project.updated_at)}
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

