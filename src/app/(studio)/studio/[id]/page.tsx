'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useProjectQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useProjects,
  ProjectDialog,
  DeleteProjectDialog,
} from '@/features/projects';
import { ProjectNav } from '@/features/projects/components/project-nav';
import {
  PipelineSidebar,
  type PipelineStep,
} from '@/features/projects/components/pipeline-sidebar';
import { ScriptStep } from '@/features/projects/components/steps/script-step';
import { CharactersStep } from '@/features/projects/components/steps/characters-step';
import { ScenesStep } from '@/features/projects/components/steps/scenes-step';
import { GenerateStep } from '@/features/projects/components/steps/generate-step';
import { EditStep } from '@/features/projects/components/steps/edit-step';
import { ExportStep } from '@/features/projects/components/steps/export-step';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [activeStep, setActiveStep] = useState<PipelineStep>('script');

  const { data: project, isLoading, error } = useProjectQuery(id);
  const updateMutation = useUpdateProjectMutation();
  const deleteMutation = useDeleteProjectMutation();

  const {
    editProject,
    deleteProject,
    openEdit,
    closeEdit,
    openDelete,
    closeDelete,
  } = useProjects();

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
      />

      {/* Pipeline workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — production pipeline sidebar */}
        <PipelineSidebar activeStep={activeStep} onStepChange={setActiveStep} />

        {/* Right — step content */}
        <div className="flex-1 overflow-hidden">
          {activeStep === 'script' && <ScriptStep />}
          {activeStep === 'characters' && <CharactersStep />}
          {activeStep === 'scenes' && <ScenesStep />}
          {activeStep === 'generate' && <GenerateStep />}
          {activeStep === 'edit' && <EditStep />}
          {activeStep === 'export' && <ExportStep />}
        </div>
      </div>

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
