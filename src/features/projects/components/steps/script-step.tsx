'use client';

import { ScrollText, Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useScriptEditor } from '@/features/projects/hooks';
import {
  ScriptChapterSidebar,
  ScriptContentPanel,
  ScriptEmptyState,
  ScriptAddDialog,
  ScriptRenameDialog,
  ScriptDeleteDialog,
  ScriptAiDialog,
  ScriptFullGenDialog,
} from '@/features/projects/components/script';
import type { ScriptStepProps } from '@/features/projects/types';

/* ──────────────────────────────────────────────────────────────────
 * ScriptStep — thin orchestrator
 * ────────────────────────────────────────────────────────────────── */
export function ScriptStep({ project_id, director_persona }: ScriptStepProps) {
  const s = useScriptEditor({ project_id, director_persona });

  if (s.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Step header */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <ScrollText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Script</h2>
              <p className="text-xs text-muted-foreground">
                Organize your screenplay into chapters
                {director_persona && (
                  <span className="text-violet-400/70">
                    {' '}· Directed by {director_persona.name}
                  </span>
                )}
              </p>
            </div>
          </div>
          {s.chapters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => s.setFullGenDialogOpen(true)}
            >
              <Wand2 className="mr-1.5 h-3 w-3" />
              Generate Full Script
            </Button>
          )}
        </div>

        {/* Two-panel layout */}
        <div className="flex flex-1 overflow-hidden">
          <ScriptChapterSidebar
            chapters={s.sortedChapters}
            selectedId={s.selectedId}
            onSelect={s.setSelectedId}
            onAdd={() => s.setAddDialogOpen(true)}
            onAiGenerate={s.openAiDialog}
            onRename={s.openRenameDialog}
            onDelete={s.openDeleteDialog}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            {s.selectedChapter ? (
              <ScriptContentPanel
                chapter={s.selectedChapter}
                editingId={s.editingId}
                editContent={s.editContent}
                onEditContentChange={s.setEditContent}
                onStartEditing={s.startEditing}
                onCancelEditing={s.cancelEditing}
                onSave={s.saveContent}
                onAiGenerate={s.openAiDialog}
                isUpdatePending={s.isUpdatePending}
                wordCount={s.wordCount}
                charCount={s.charCount}
              />
            ) : (
              <ScriptEmptyState
                hasChapters={s.chapters.length > 0}
                onAddChapter={() => s.setAddDialogOpen(true)}
                onGenerateScript={() => s.setFullGenDialogOpen(true)}
              />
            )}
          </div>
        </div>

        {/* Dialogs */}
        <ScriptAddDialog
          open={s.addDialogOpen}
          onOpenChange={s.setAddDialogOpen}
          title={s.addTitle}
          onTitleChange={s.setAddTitle}
          onSubmit={s.handleAddChapter}
          isPending={s.isCreatePending}
        />
        <ScriptRenameDialog
          open={s.renameDialogOpen}
          onOpenChange={s.setRenameDialogOpen}
          title={s.renameTitle}
          onTitleChange={s.setRenameTitle}
          onSubmit={s.handleRename}
          isPending={s.isUpdatePending}
        />
        <ScriptDeleteDialog
          open={s.deleteDialogOpen}
          onOpenChange={s.setDeleteDialogOpen}
          chapterTitle={s.deleteTarget?.title}
          onConfirm={s.handleDelete}
          isPending={s.isDeletePending}
        />
        <ScriptAiDialog
          open={s.aiDialogOpen}
          onOpenChange={s.setAiDialogOpen}
          chapterTitle={s.aiTargetChapter?.title}
          directorPersona={director_persona}
          prompt={s.aiPrompt}
          onPromptChange={s.setAiPrompt}
          onGenerate={s.handleAiGenerate}
          isPending={s.isGeneratePending}
        />
        <ScriptFullGenDialog
          open={s.fullGenDialogOpen}
          onOpenChange={s.setFullGenDialogOpen}
          directorPersona={director_persona}
          prompt={s.fullGenPrompt}
          onPromptChange={s.setFullGenPrompt}
          onGenerate={s.handleFullScriptGenerate}
          isLoading={s.fullGenLoading}
        />
      </div>
    </TooltipProvider>
  );
}
