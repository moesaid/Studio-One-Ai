import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as chaptersApi from '../services/chapters-api';
import type { CreateChapterPayload } from '../types';

export const chapterQueryKeys = {
  all: (projectId: string) => ['chapters', projectId] as const,
};

export function useChaptersQuery(projectId: string) {
  return useQuery({
    queryKey: chapterQueryKeys.all(projectId),
    queryFn: () => chaptersApi.getChapters(projectId),
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateChapterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: CreateChapterPayload;
    }) => chaptersApi.createChapter(projectId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chapterQueryKeys.all(variables.projectId),
      });
      toast.success('Chapter created');
    },
    onError: () => {
      toast.error('Failed to create chapter');
    },
  });
}

export function useUpdateChapterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      chapterId,
      data,
    }: {
      projectId: string;
      chapterId: string;
      data: Partial<{ title: string; content: string; order: number }>;
    }) => chaptersApi.updateChapter(projectId, chapterId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chapterQueryKeys.all(variables.projectId),
      });
    },
    onError: () => {
      toast.error('Failed to update chapter');
    },
  });
}

export function useDeleteChapterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      chapterId,
    }: {
      projectId: string;
      chapterId: string;
    }) => chaptersApi.deleteChapter(projectId, chapterId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chapterQueryKeys.all(variables.projectId),
      });
      toast.success('Chapter deleted');
    },
    onError: () => {
      toast.error('Failed to delete chapter');
    },
  });
}
