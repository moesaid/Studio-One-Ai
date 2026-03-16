'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  ProjectCard,
  ProjectDialog,
  DeleteProjectDialog,
  ProjectsHeader,
  ProjectsEmptyState,
  useProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useProjects,
} from '@/features/projects';

export default function StudioPage() {
  const { data: projects, isLoading } = useProjectsQuery();
  const createMutation = useCreateProjectMutation();
  const updateMutation = useUpdateProjectMutation();
  const deleteMutation = useDeleteProjectMutation();

  const {
    createOpen,
    editProject,
    deleteProject,
    search,
    setSearch,
    openCreate,
    closeCreate,
    openEdit,
    closeEdit,
    openDelete,
    closeDelete,
    filterProjects,
    formatDate,
  } = useProjects();

  const filtered = projects ? filterProjects(projects) : [];

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <ProjectsHeader
        search={search}
        onSearchChange={setSearch}
        onCreateClick={openCreate}
      />

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border">
              {/* Thumbnail skeleton */}
              <Skeleton className="aspect-video w-full rounded-none" />
              {/* Content skeleton */}
              <div className="space-y-3 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-16 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-2/3" />
                </div>
                <div className="border-t border-border/50 pt-3">
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <ProjectsEmptyState
          onCreateClick={openCreate}
          hasSearch={!!search.trim()}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={openEdit}
              onDelete={openDelete}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <ProjectDialog
        open={createOpen}
        onClose={closeCreate}
        onCreateSubmit={(payload) => {
          createMutation.mutate(payload, { onSuccess: closeCreate });
        }}
        isLoading={createMutation.isPending}
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
            deleteMutation.mutate(deleteProject.id, { onSuccess: closeDelete });
          }
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
