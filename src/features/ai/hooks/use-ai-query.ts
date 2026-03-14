import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as api from '../services/ai-api';

export function useGenerateTextMutation() {
  return useMutation({
    mutationFn: api.generateText,
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate text');
    },
  });
}

export function useGenerateImageMutation() {
  return useMutation({
    mutationFn: api.generateImage,
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate image');
    },
  });
}
