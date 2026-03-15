import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as charactersApi from '../services/characters-api';
import type { CreateCharacterPayload, UpdateCharacterPayload } from '../types';

export const characterQueryKeys = {
  all: (projectId: string) => ['characters', projectId] as const,
};

export function useCharactersQuery(projectId: string) {
  return useQuery({
    queryKey: characterQueryKeys.all(projectId),
    queryFn: () => charactersApi.getCharacters(projectId),
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCharacterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: CreateCharacterPayload;
    }) => charactersApi.createCharacter(projectId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: characterQueryKeys.all(variables.projectId),
      });
      toast.success('Character created');
    },
    onError: () => {
      toast.error('Failed to create character');
    },
  });
}

export function useUpdateCharacterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      characterId,
      data,
    }: {
      projectId: string;
      characterId: string;
      data: UpdateCharacterPayload;
    }) => charactersApi.updateCharacter(projectId, characterId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: characterQueryKeys.all(variables.projectId),
      });
      toast.success('Character updated');
    },
    onError: () => {
      toast.error('Failed to update character');
    },
  });
}

export function useDeleteCharacterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      characterId,
    }: {
      projectId: string;
      characterId: string;
    }) => charactersApi.deleteCharacter(projectId, characterId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: characterQueryKeys.all(variables.projectId),
      });
      toast.success('Character deleted');
    },
    onError: () => {
      toast.error('Failed to delete character');
    },
  });
}
