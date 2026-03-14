import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as api from '../services';
import type { CreateProjectPayload, UpdateProjectPayload, DirectorPersona } from '../types';

export const projectQueryKeys = {
  all: ['projects'] as const,
  list: () => [...projectQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...projectQueryKeys.all, 'detail', id] as const,
};

export function useProjectQuery(id: string) {
  return useQuery({
    queryKey: projectQueryKeys.detail(id),
    queryFn: async () => {
      const res = await api.getProject(id);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

export function useProjectsQuery() {
  return useQuery({
    queryKey: projectQueryKeys.list(),
    queryFn: async () => {
      const res = await api.getProjects();
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => api.createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.list() });
      toast.success('Project created');
    },
    onError: () => {
      toast.error('Failed to create project');
    },
  });
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProjectPayload) => api.updateProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.list() });
      toast.success('Project updated');
    },
    onError: () => {
      toast.error('Failed to update project');
    },
  });
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.list() });
      toast.success('Project deleted');
    },
    onError: () => {
      toast.error('Failed to delete project');
    },
  });
}

export function useUpdateScriptMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, script }: { id: string; script: string }) =>
      api.updateProjectScript(id, script),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectQueryKeys.detail(variables.id),
      });
      toast.success('Script saved');
    },
    onError: () => {
      toast.error('Failed to save script');
    },
  });
}

export function useUpdatePersonaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, persona }: { id: string; persona: DirectorPersona }) =>
      api.updateProjectPersona(id, persona),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectQueryKeys.detail(variables.id),
      });
      toast.success('Director persona set');
    },
    onError: () => {
      toast.error('Failed to set persona');
    },
  });
}
