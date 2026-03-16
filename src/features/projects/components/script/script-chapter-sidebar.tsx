'use client';

import { Plus, Sparkles, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ScriptChapter } from '@/features/projects/types';

interface ScriptChapterSidebarProps {
  chapters: ScriptChapter[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onAiGenerate: (chapter: ScriptChapter) => void;
  onRename: (chapter: ScriptChapter) => void;
  onDelete: (chapter: ScriptChapter) => void;
}

export function ScriptChapterSidebar({
  chapters,
  selectedId,
  onSelect,
  onAdd,
  onAiGenerate,
  onRename,
  onDelete,
}: ScriptChapterSidebarProps) {
  return (
    <div className="flex w-[220px] shrink-0 flex-col border-r border-border/50 bg-black/20">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Chapters
        </span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-1 pb-8">
          {chapters.length > 0 ? (
            chapters.map((chapter, idx) => {
              const isSelected = selectedId === chapter.id;
              return (
                <div key={chapter.id}>
                  <Tooltip>
                    <TooltipTrigger
                      render={<div />}
                      className={`
                        group relative flex items-center gap-2.5 cursor-pointer transition-all
                        py-2 pl-3 pr-2
                        ${isSelected
                          ? 'bg-white/[0.06] text-foreground'
                          : 'text-muted-foreground hover:bg-white/[0.03] hover:text-foreground/80'
                        }
                      `}
                      onClick={() => onSelect(chapter.id)}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-orange-500" />
                      )}
                      <span
                        className={`shrink-0 flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                          isSelected
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-white/[0.04] text-muted-foreground/50'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="flex-1 truncate text-[12px] font-medium leading-tight">
                        {chapter.title}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 h-5 w-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => onAiGenerate(chapter)}>
                            <Sparkles className="mr-2 h-3.5 w-3.5" />
                            Generate with AI
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onRename(chapter)}>
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(chapter)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipTrigger>
                    {chapter.title.length > 22 && (
                      <TooltipContent side="right" className="max-w-[200px]">
                        <p className="text-xs">{chapter.title}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                  <div className="mx-3 border-b border-border/10" />
                </div>
              );
            })
          ) : (
            <div className="px-3 py-6 text-center">
              <p className="text-[11px] text-muted-foreground">No chapters yet</p>
              <Button variant="outline" size="sm" className="mt-2 h-7 text-[11px]" onClick={onAdd}>
                <Plus className="mr-1.5 h-3 w-3" />
                Add Chapter
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
