'use client';

import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  ConnectionLineType,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Loader2 } from 'lucide-react';
import { useCharactersCanvas } from '@/features/projects/hooks';
import type { CharactersStepProps } from '@/features/projects/types';

import {
  nodeTypes,
  CharacterFormDialog,
  CharacterDeleteDialog,
  CharacterExtractDialog,
  CharacterVisualsDialog,
  CharactersEmptyState,
  CharactersToolbar,
  CharactersQuickNav,
  CharactersShortcutsPanel,
  CharactersRoleLegend,
} from '../characters';

/* ─── Public Wrapper ─────────────────────────────────────────── */

export function CharactersStep(props: CharactersStepProps) {
  return (
    <ReactFlowProvider>
      <CharactersStepInner {...props} />
    </ReactFlowProvider>
  );
}

/* ─── Inner (pure render) ────────────────────────────────────── */

function CharactersStepInner({ project_id, director_persona, film_style }: CharactersStepProps) {
  const canvas = useCharactersCanvas({ project_id, director_persona });

  // Build a project-like object for the visuals dialog
  const projectForDialog = {
    id: project_id,
    director_persona,
    film_style,
  } as import('@/features/projects/types').Project;

  /* ── Loading ── */
  if (canvas.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* ── Empty state ── */
  if (canvas.sortedCharacters.length === 0) {
    return (
      <CharactersEmptyState
        hasChapters={canvas.chapters.length > 0}
        extractLoading={canvas.extractLoading}
        extractStep={canvas.extractStep}
        onExtract={canvas.handleExtractFromScript}
        onAdd={canvas.openCreateForm}
        formOpen={canvas.formOpen}
        onFormOpenChange={canvas.setFormOpen}
        editingCharacter={canvas.editingCharacter}
        formData={canvas.formData}
        setFormData={canvas.setFormData}
        onFormSubmit={canvas.handleFormSubmit}
        isFormPending={canvas.isFormPending}
      />
    );
  }

  /* ── Canvas ── */
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={canvas.nodes}
          edges={canvas.edges}
          onNodesChange={canvas.onNodesChange as OnNodesChange}
          onEdgesChange={canvas.onEdgesChange as OnEdgesChange}
          onNodeDragStop={canvas.onNodeDragStop}
          onNodeDoubleClick={canvas.onNodeDoubleClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
          minZoom={0.15}
          maxZoom={1.5}
          connectionLineType={ConnectionLineType.SmoothStep}
          deleteKeyCode={null}
          proOptions={{ hideAttribution: true }}
          className="characters-flow"
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1.5} color="rgba(255,255,255,0.25)" />
          <Controls
            showInteractive={false}
            className="!bg-card/90 !border-border/30 !rounded-lg !shadow-lg !shadow-black/10 [&>button]:!bg-transparent [&>button]:!border-border/20 [&>button]:!text-foreground/60 [&>button:hover]:!bg-muted/50"
          />
          <MiniMap
            nodeColor={canvas.minimapColor}
            maskColor="rgba(0,0,0,0.7)"
            className="!bg-card/80 !border-border/30 !rounded-lg !shadow-lg"
            pannable
            zoomable
          />

          <CharactersToolbar
            characterCount={canvas.characters.length}
            hasChapters={canvas.chapters.length > 0}
            extractLoading={canvas.extractLoading}
            onExtract={canvas.handleExtractFromScript}
            onAdd={canvas.openCreateForm}
            onReorganize={canvas.handleReorganize}
          />

          <CharactersQuickNav
            characters={canvas.sortedCharacters}
            onNavigate={canvas.navigateToNode}
          />

          <CharactersRoleLegend characters={canvas.sortedCharacters} />

          <CharactersShortcutsPanel
            showHelp={canvas.showHelp}
            onToggleHelp={() => canvas.setShowHelp((v) => !v)}
          />
        </ReactFlow>
      </div>

      {/* Dialogs */}
      <CharacterFormDialog
        open={canvas.formOpen}
        onOpenChange={canvas.setFormOpen}
        editingCharacter={canvas.editingCharacter}
        formData={canvas.formData}
        setFormData={canvas.setFormData}
        onSubmit={canvas.handleFormSubmit}
        isPending={canvas.isFormPending}
      />

      <CharacterDeleteDialog
        open={canvas.deleteDialogOpen}
        onOpenChange={canvas.setDeleteDialogOpen}
        targets={canvas.deleteTargets}
        onConfirm={canvas.handleDelete}
        isDeleting={canvas.bulkDeleting}
      />

      <CharacterExtractDialog
        open={canvas.extractLoading}
        currentStep={canvas.extractStep}
      />

      <CharacterVisualsDialog
        character={canvas.visualsCharacter}
        project={projectForDialog}
        open={canvas.visualsOpen}
        onOpenChange={canvas.setVisualsOpen}
      />
    </div>
  );
}
