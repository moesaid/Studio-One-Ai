'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clapperboard, Palette, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  useProjectQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useUpdatePersonaMutation,
  useUpdateStyleMutation,
  useProjects,
  ProjectDialog,
  DeleteProjectDialog,
} from '@/features/projects';
import { ProjectNav } from '@/features/projects/components/project-nav';
import {
  PipelineSidebar,
  type PipelineStep,
} from '@/features/projects/components/pipeline-sidebar';
import { DirectorPersonaDialog } from '@/features/projects/components/director-persona-dialog';
import { FilmStyleDialog } from '@/features/projects/components/film-style-dialog';
import { ScriptStep } from '@/features/projects/components/steps/script-step';
import { CharactersStep } from '@/features/projects/components/steps/characters-step';
import { ScenesStep } from '@/features/projects/components/steps/scenes-step';
import { GenerateStep } from '@/features/projects/components/steps/generate-step';
import { EditStep } from '@/features/projects/components/steps/edit-step';
import { ExportStep } from '@/features/projects/components/steps/export-step';
import type { DirectorPersona, FilmStyle } from '@/features/projects/types';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [activeStep, setActiveStep] = useState<PipelineStep>('script');
  const [personaDialogOpen, setPersonaDialogOpen] = useState(false);
  const [styleDialogOpen, setStyleDialogOpen] = useState(false);

  const { data: project, isLoading, error } = useProjectQuery(id);
  const updateMutation = useUpdateProjectMutation();
  const deleteMutation = useDeleteProjectMutation();
  const personaMutation = useUpdatePersonaMutation();
  const styleMutation = useUpdateStyleMutation();

  const {
    editProject,
    deleteProject,
    openEdit,
    closeEdit,
    openDelete,
    closeDelete,
  } = useProjects();

  const hasPersona = !!project?.director_persona;
  const hasStyle = !!project?.film_style;
  const isSetupComplete = hasPersona && hasStyle;



  // Derive setup step: 1 = director, 2 = style
  const setupStep = !hasPersona ? 1 : !hasStyle ? 2 : 0;

  // Auto-open setup dialogs when project loads
  useEffect(() => {
    if (!project) return;
    if (!project.director_persona) {
      setPersonaDialogOpen(true);
    } else if (!project.film_style) {
      setStyleDialogOpen(true);
    }
  }, [project]);

  function handlePersonaSelect(persona: DirectorPersona) {
    personaMutation.mutate(
      { id, persona },
      {
        onSuccess: () => {
          setPersonaDialogOpen(false);
          // Auto-open style dialog after selecting director
          if (!project?.film_style) {
            setTimeout(() => setStyleDialogOpen(true), 300);
          }
        },
      }
    );
  }

  function handleStyleSelect(style: FilmStyle) {
    styleMutation.mutate(
      { id, style },
      {
        onSuccess: () => {
          setStyleDialogOpen(false);
        },
      }
    );
  }

  if (isLoading) {
    return <WorkspaceSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Project not found</h2>
          <p className="text-sm text-muted-foreground">
            This project may have been deleted or you don&apos;t have access.
          </p>
        </div>
        <Link
          href="/studio"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-49px)] flex-col">
      {/* Project Nav — compact top bar */}
      <ProjectNav
        project={project}
        onEdit={() => openEdit(project)}
        onDelete={() => openDelete(project)}
        onChangeDirector={() => setPersonaDialogOpen(true)}
        onChangeStyle={() => setStyleDialogOpen(true)}
      />

      {/* Pipeline workspace — locked until setup is complete */}
      {isSetupComplete ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Left — production pipeline sidebar */}
          <PipelineSidebar activeStep={activeStep} onStepChange={setActiveStep} />

          {/* Right — step content */}
          <div className="flex-1 overflow-hidden">
            {activeStep === 'script' && <ScriptStep project_id={id} director_persona={project.director_persona} />}
            {activeStep === 'characters' && <CharactersStep project_id={id} director_persona={project.director_persona} film_style={project.film_style} />}
            {activeStep === 'scenes' && <ScenesStep project_id={id} director_persona={project.director_persona} film_style={project.film_style} />}
            {activeStep === 'generate' && <GenerateStep />}
            {activeStep === 'edit' && <EditStep />}
            {activeStep === 'export' && <ExportStep />}
          </div>
        </div>
      ) : (
        /* 2-step setup — director + style */
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-6 text-center max-w-lg px-4">
            {/* Step indicators */}
            <div className="flex items-center gap-3">
              <StepIndicator
                step={1}
                label="Director"
                icon={<Clapperboard className="h-4 w-4" />}
                isComplete={hasPersona}
                isActive={setupStep === 1}
              />
              <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
              <StepIndicator
                step={2}
                label="Film Style"
                icon={<Palette className="h-4 w-4" />}
                isComplete={hasStyle}
                isActive={setupStep === 2}
              />
            </div>

            {/* Current step content */}
            {setupStep === 1 ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 ring-1 ring-violet-500/15">
                  <Clapperboard className="h-7 w-7 text-violet-400/70" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Step 1: Choose Your Director</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Every project needs a Director Persona to guide AI in generating scripts, characters,
                    scenes, and visuals. Pick a preset style or create your own.
                  </p>
                </div>
                <button
                  onClick={() => setPersonaDialogOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                >
                  <Clapperboard className="h-4 w-4" />
                  Select Director Persona
                </button>
              </>
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 ring-1 ring-amber-500/15">
                  <Palette className="h-7 w-7 text-amber-400/70" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Step 2: Choose Your Film Style</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your Film Style defines the visual tone for all AI-generated images and videos — from
                    cinematic noir to anime watercolor. Choose a preset or create a custom look.
                  </p>
                </div>
                <button
                  onClick={() => setStyleDialogOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                >
                  <Palette className="h-4 w-4" />
                  Select Film Style
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Director Persona Dialog */}
      <DirectorPersonaDialog
        open={personaDialogOpen}
        onClose={() => setPersonaDialogOpen(false)}
        current_persona={project.director_persona}
        onSelect={handlePersonaSelect}
        is_loading={personaMutation.isPending}
      />

      {/* Film Style Dialog */}
      <FilmStyleDialog
        open={styleDialogOpen}
        onClose={() => setStyleDialogOpen(false)}
        current_style={project.film_style}
        onSelect={handleStyleSelect}
        is_loading={styleMutation.isPending}
      />

      {/* Edit Dialog */}
      <ProjectDialog
        open={!!editProject}
        onClose={closeEdit}
        project={editProject}
        onEditSubmit={(payload) => {
          updateMutation.mutate(payload, { onSuccess: closeEdit });
        }}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Dialog */}
      <DeleteProjectDialog
        open={!!deleteProject}
        onClose={closeDelete}
        project={deleteProject}
        onConfirm={() => {
          if (deleteProject) {
            deleteMutation.mutate(deleteProject.id, {
              onSuccess: () => {
                closeDelete();
                window.location.href = '/studio';
              },
            });
          }
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

/* ── Step indicator for the 2-step setup ── */
function StepIndicator({
  step,
  label,
  icon,
  isComplete,
  isActive,
}: {
  step: number;
  label: string;
  icon: React.ReactNode;
  isComplete: boolean;
  isActive: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
        isComplete
          ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
          : isActive
            ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
            : 'bg-muted/50 text-muted-foreground'
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center text-[11px]">
        {isComplete ? '✓' : icon}
      </span>
      <span className="hidden sm:inline">
        {step}. {label}
      </span>
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="flex h-[calc(100vh-49px)] flex-col">
      {/* Nav skeleton */}
      <div className="flex h-12 items-center justify-between border-b border-border/50 px-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-7 w-14 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
        </div>
      </div>

      {/* Body skeleton */}
      <div className="flex flex-1">
        {/* Sidebar skeleton */}
        <div className="flex w-[200px] shrink-0 flex-col border-r border-border/50 p-2 space-y-1">
          <Skeleton className="h-4 w-16 mb-2" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="flex-1 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="mx-auto h-48 max-w-3xl rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
