import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as videoClipsApi from '../services/video-clips-api';
import type { CreateVideoClipPayload, VideoClip } from '../types';

export const videoClipKeys = {
  all: ['video-clips'] as const,
  list: (projectId: string) => [...videoClipKeys.all, 'list', projectId] as const,
  byScene: (projectId: string, sceneId: string) =>
    [...videoClipKeys.all, 'scene', projectId, sceneId] as const,
};

/**
 * Fetch all video clips for a project.
 */
export function useVideoClipsQuery(projectId: string) {
  return useQuery({
    queryKey: videoClipKeys.list(projectId),
    queryFn: () => videoClipsApi.getVideoClips(projectId),
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
    enabled: !!projectId,
  });
}

/**
 * Fetch video clips for a specific scene.
 */
export function useVideoClipsBySceneQuery(projectId: string, sceneId: string) {
  return useQuery({
    queryKey: videoClipKeys.byScene(projectId, sceneId),
    queryFn: () => videoClipsApi.getVideoClipsByScene(projectId, sceneId),
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
    enabled: !!projectId && !!sceneId,
  });
}

/**
 * Create a new video clip record.
 */
export function useCreateVideoClipMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVideoClipPayload) =>
      videoClipsApi.createVideoClip(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoClipKeys.list(projectId) });
    },
    onError: () => {
      toast.error('Failed to create video clip record.');
    },
  });
}

/**
 * Update a video clip record (status, url, etc.).
 */
export function useUpdateVideoClipMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clipId, payload }: { clipId: string; payload: Partial<VideoClip> }) =>
      videoClipsApi.updateVideoClip(projectId, clipId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoClipKeys.list(projectId) });
    },
  });
}

/**
 * Delete a video clip.
 */
export function useDeleteVideoClipMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clipId: string) => videoClipsApi.deleteVideoClip(projectId, clipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoClipKeys.list(projectId) });
      toast.success('Video clip deleted.');
    },
    onError: () => {
      toast.error('Failed to delete video clip.');
    },
  });
}
