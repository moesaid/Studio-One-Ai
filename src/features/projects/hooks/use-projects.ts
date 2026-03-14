import { useState, useCallback, useMemo } from 'react';
import type { Project } from '../types';

export function useProjects() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [search, setSearch] = useState('');

  const openCreate = useCallback(() => setCreateOpen(true), []);
  const closeCreate = useCallback(() => setCreateOpen(false), []);

  const openEdit = useCallback((project: Project) => setEditProject(project), []);
  const closeEdit = useCallback(() => setEditProject(null), []);

  const openDelete = useCallback((project: Project) => setDeleteProject(project), []);
  const closeDelete = useCallback(() => setDeleteProject(null), []);

  const filterProjects = useCallback(
    (projects: Project[]) => {
      if (!search.trim()) return projects;
      const q = search.toLowerCase();
      return projects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    },
    [search],
  );

  const formatDate = useCallback((dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  return useMemo(
    () => ({
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
    }),
    [
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
    ],
  );
}
