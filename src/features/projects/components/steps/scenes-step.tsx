'use client';

import { Loader2 } from 'lucide-react';
import { useScenes } from '@/features/projects/hooks';
import type { ScenesStepProps } from '@/features/projects/types';
import {
  SceneCard,
  SceneFormDialog,
  SceneDeleteDialog,
  SceneExtractDialog,
  SceneExtractConfigDialog,
  ScenesEmptyState,
  ScenesToolbar,
} from '../scenes';

/* ── Scenes Step — storyboard-style scene list ── */

export function ScenesStep({ project_id, project_title, project_description, director_persona, film_style }: ScenesStepProps) {
  const s = useScenes({ project_id, project_title, project_description, director_persona, film_style });

  /* Loading */
  if (s.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* Empty state */
  if (s.sortedScenes.length === 0) {
    return (
      <>
        <ScenesEmptyState
          hasChapters={s.chapters.length > 0}
          extractLoading={s.extractLoading}
          extractStep={s.extractStep}
          onExtract={s.handleExtractFromScript}
          onAdd={s.openCreateForm}
        />
        <SceneExtractConfigDialog
          open={s.configDialogOpen}
          onOpenChange={s.setConfigDialogOpen}
          onConfirm={s.handleStartExtraction}
        />
      </>
    );
  }

  /* Main view — toolbar + scrollable scene list */
  return (
    <div className="flex h-full flex-col">
      <ScenesToolbar
        sceneCount={s.scenes.length}
        hasChapters={s.chapters.length > 0}
        extractLoading={s.extractLoading}
        searchQuery={s.searchQuery}
        onSearchChange={s.setSearchQuery}
        onExtract={s.handleExtractFromScript}
        onAdd={s.openCreateForm}
      />

      {/* Scene cards — grid layout */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {s.filteredScenes.map((scene) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              characters={s.characters}
              isSelected={s.selectedId === scene.id}
              onSelect={(sc) => s.setSelectedId(sc.id)}
              onEdit={s.openEditForm}
              onDelete={s.openDeleteDialog}
            />
          ))}
        </div>
        {s.filteredScenes.length === 0 && s.searchQuery && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No scenes match &ldquo;{s.searchQuery}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <SceneFormDialog
        open={s.formOpen}
        onOpenChange={s.setFormOpen}
        editingScene={s.editingScene}
        formData={s.formData}
        setFormData={s.setFormData}
        onSubmit={s.handleFormSubmit}
        isPending={s.isFormPending}
        characters={s.characters}
        onRegenerateImage={s.handleRegenerateImage}
        isRegenerating={s.isRegenerating}
      />

      <SceneDeleteDialog
        open={s.deleteDialogOpen}
        onOpenChange={s.setDeleteDialogOpen}
        scene={s.deleteTarget}
        onConfirm={s.handleDelete}
        isDeleting={s.isDeletePending}
      />

      <SceneExtractDialog
        open={s.extractLoading}
        currentStep={s.extractStep}
        progress={s.extractProgress}
      />

      <SceneExtractConfigDialog
        open={s.configDialogOpen}
        onOpenChange={s.setConfigDialogOpen}
        onConfirm={s.handleStartExtraction}
      />
    </div>
  );
}
