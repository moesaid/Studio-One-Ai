import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as api from '../services/scenes-api';
import type { CreateScenePayload } from '../types';

export const sceneQueryKeys = {
  all: (projectId: string) => ['scenes', projectId] as const,
  list: (projectId: string) => [...sceneQueryKeys.all(projectId), 'list'] as const,
};

export function useScenesQuery(projectId: string) {
  return useQuery({
    queryKey: sceneQueryKeys.list(projectId),
    queryFn: () => api.getScenes(projectId).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
    enabled: !!projectId,
  });
}

export function useCreateSceneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: CreateScenePayload }) =>
      api.createScene(projectId, payload),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: sceneQueryKeys.list(projectId) });
      toast.success('Scene created');
    },
    onError: () => {
      toast.error('Failed to create scene');
    },
  });
}

export function useUpdateSceneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      sceneId,
      data,
    }: {
      projectId: string;
      sceneId: string;
      data: Parameters<typeof api.updateScene>[2];
    }) => api.updateScene(projectId, sceneId, data),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: sceneQueryKeys.list(projectId) });
      toast.success('Scene updated');
    },
    onError: () => {
      toast.error('Failed to update scene');
    },
  });
}

export function useDeleteSceneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, sceneId }: { projectId: string; sceneId: string }) =>
      api.deleteScene(projectId, sceneId),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: sceneQueryKeys.list(projectId) });
      toast.success('Scene deleted');
    },
    onError: () => {
      toast.error('Failed to delete scene');
    },
  });
}
