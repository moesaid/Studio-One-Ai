'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  generateVideoClip,
  pollVideoOperation,
  generateMusic,
} from '@/features/ai/services/ai-api';
import * as videoClipsApi from '../services/video-clips-api';
import { videoClipKeys } from './use-video-clips-query';
import type { Scene, DirectorPersona, FilmStyle, VideoClip } from '../types';

const POLL_INTERVAL = 5000; // 5 seconds

interface UseVideoClipsOptions {
  project_id: string;
  director_persona: DirectorPersona | null;
  film_style: FilmStyle | null;
}

interface VideoConfig {
  video_model: string;
  duration: number;
  aspect_ratio: string;
  resolution: string;
  generate_audio: boolean;
}

export function useVideoClips({
  project_id,
  director_persona,
  film_style,
}: UseVideoClipsOptions) {
  const queryClient = useQueryClient();
  const pollingTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Tracks which clips are currently being generated / polled
  const [generatingClips, setGeneratingClips] = useState<Set<string>>(new Set());
  const [generatingAudio, setGeneratingAudio] = useState<Set<string>>(new Set());
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Default config
  const [config, setConfig] = useState<VideoConfig>({
    video_model: 'veo-3.0-generate-001',
    duration: 8,
    aspect_ratio: '16:9',
    resolution: '720p',
    generate_audio: true,
  });

  const invalidateClips = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: videoClipKeys.list(project_id) });
  }, [queryClient, project_id]);

  /**
   * Start polling a video operation until done.
   */
  const startPolling = useCallback(
    (clipId: string, operationName: string) => {
      // Clear any existing timer for this clip
      const existing = pollingTimers.current.get(clipId);
      if (existing) clearInterval(existing);

      const timer = setInterval(async () => {
        try {
          const result = await pollVideoOperation(operationName);

          if (result.done) {
            clearInterval(timer);
            pollingTimers.current.delete(clipId);

            if (result.error) {
              await videoClipsApi.updateVideoClip(project_id, clipId, {
                status: 'failed',
                error_message: result.error,
              });
              toast.error(`Video generation failed: ${result.error}`);
            } else if (result.videos && result.videos.length > 0) {
              const video = result.videos[0];
              let videoUrl: string | null = null;

              if (video.bytes_base64) {
                // Upload base64 video to Storage
                const videoBytes = Uint8Array.from(
                  atob(video.bytes_base64),
                  (c) => c.charCodeAt(0)
                );
                videoUrl = await videoClipsApi.uploadVideoFile(
                  project_id,
                  clipId,
                  videoBytes,
                  video.mime_type
                );
              } else if (video.gcs_uri) {
                // Store GCS URI directly (or convert if needed)
                videoUrl = video.gcs_uri;
              }

              await videoClipsApi.updateVideoClip(project_id, clipId, {
                status: 'done',
                video_url: videoUrl,
              });
              toast.success('Video clip generated successfully!');
            }

            setGeneratingClips((prev) => {
              const next = new Set(prev);
              next.delete(clipId);
              return next;
            });
            invalidateClips();
          }
        } catch (err) {
          console.error('[polling] Error:', err);
          // Don't stop polling on network errors, just retry
        }
      }, POLL_INTERVAL);

      pollingTimers.current.set(clipId, timer);
    },
    [project_id, invalidateClips]
  );

  /**
   * Generate a video clip for a single scene keyframe.
   * @param customInstruction Optional user instruction for regeneration
   * @param configOverrides  Optional per-clip config overrides (model, duration, etc.)
   */
  const handleGenerateClip = useCallback(
    async (
      scene: Scene,
      keyframeIndex: number,
      customInstruction?: string,
      configOverrides?: Partial<VideoConfig>
    ) => {
      const imageUrl = scene.reference_images?.[keyframeIndex];
      if (!imageUrl) {
        toast.error('No keyframe image found for this scene.');
        return;
      }

      // Merge global config with per-clip overrides
      const clipConfig = { ...config, ...configOverrides };

      const clipKey = `${scene.id}-${keyframeIndex}`;
      setGeneratingClips((prev) => new Set(prev).add(clipKey));

      const toastId = `gen-${clipKey}`;
      try {
        // Fetch the image and convert to base64
        toast.loading('Preparing keyframe image…', { id: toastId });
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();
        const imageMimeType = imageBlob.type || 'image/png';
        const imageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // strip data:... prefix
          };
          reader.readAsDataURL(imageBlob);
        });

        // Build prompt scoped to THIS specific keyframe
        const totalKeyframes = scene.reference_images?.length || 1;
        const frameLabel =
          keyframeIndex === 0
            ? 'opening shot'
            : keyframeIndex === totalKeyframes - 1
            ? 'closing shot'
            : `frame ${keyframeIndex + 1} of ${totalKeyframes}`;

        const basePrompt = customInstruction
          ? customInstruction
          : scene.visual_description || scene.description;

        // Scope the prompt to this single keyframe so Veo animates
        // only the provided image, not the entire scene narrative.
        const prompt = `Animate this single keyframe (${frameLabel}) as a short video clip. Focus only on this specific image — bring it to life with subtle motion, camera movement, and atmosphere. Context: ${basePrompt}`;

        // Start Veo generation
        toast.loading('Starting video generation…', { id: toastId });
        const { operation_name } = await generateVideoClip({
          image_base64: imageBase64,
          image_mime_type: imageMimeType,
          prompt,
          video_model: clipConfig.video_model,
          duration: clipConfig.duration,
          aspect_ratio: clipConfig.aspect_ratio,
          resolution: clipConfig.resolution,
          generate_audio: clipConfig.generate_audio,
          director_name: director_persona?.name,
          director_style: director_persona?.style,
          film_style_name: film_style?.name,
          film_style_description: film_style?.preview_keywords,
          scene_title: scene.title,
          scene_description: `${frameLabel}: ${basePrompt}`,
        });

        // Create Firestore record
        const { data: clip } = await videoClipsApi.createVideoClip(project_id, {
          scene_id: scene.id,
          keyframe_index: keyframeIndex,
          duration: config.duration,
          video_model: config.video_model,
          operation_name,
        });

        invalidateClips();

        // Start polling
        startPolling(clip.id, operation_name);

        // Update the clipKey to the real clip ID
        setGeneratingClips((prev) => {
          const next = new Set(prev);
          next.delete(clipKey);
          next.add(clip.id);
          return next;
        });

        toast.success('Video generation started! This may take a few minutes.', { id: toastId });
      } catch (err) {
        console.error('[handleGenerateClip] Error:', err);
        toast.error(
          err instanceof Error ? err.message : 'Failed to start video generation.',
          { id: toastId }
        );
        setGeneratingClips((prev) => {
          const next = new Set(prev);
          next.delete(clipKey);
          return next;
        });
      }
    },
    [config, director_persona, film_style, project_id, invalidateClips, startPolling]
  );

  /**
   * Generate music/audio for a scene clip.
   */
  const handleGenerateAudio = useCallback(
    async (scene: Scene, clip: VideoClip) => {
      setGeneratingAudio((prev) => new Set(prev).add(clip.id));

      try {
        toast.info('Generating soundtrack…');
        const result = await generateMusic({
          prompt: `Instrumental soundtrack for: ${scene.visual_description || scene.description}. ${scene.mood || ''}`,
          director_name: director_persona?.name,
          director_style: director_persona?.style,
          film_style_name: film_style?.name,
          scene_title: scene.title,
          scene_mood: scene.mood,
        });

        // Upload audio to Storage
        const audioBytes = Uint8Array.from(
          atob(result.audio_content),
          (c) => c.charCodeAt(0)
        );
        const audioUrl = await videoClipsApi.uploadAudioFile(
          project_id,
          clip.id,
          audioBytes,
          result.mime_type
        );

        await videoClipsApi.updateVideoClip(project_id, clip.id, {
          audio_url: audioUrl,
        });

        invalidateClips();
        toast.success('Audio generated successfully!');
      } catch (err) {
        console.error('[handleGenerateAudio] Error:', err);
        toast.error(
          err instanceof Error ? err.message : 'Failed to generate audio.'
        );
      } finally {
        setGeneratingAudio((prev) => {
          const next = new Set(prev);
          next.delete(clip.id);
          return next;
        });
      }
    },
    [director_persona, film_style, project_id, invalidateClips]
  );

  /**
   * Resume polling for any clips that are still in 'generating' status.
   */
  const resumePolling = useCallback(
    (clips: VideoClip[]) => {
      clips
        .filter((c) => c.status === 'generating' && c.operation_name)
        .forEach((clip) => {
          if (!pollingTimers.current.has(clip.id)) {
            setGeneratingClips((prev) => new Set(prev).add(clip.id));
            startPolling(clip.id, clip.operation_name!);
          }
        });
    },
    [startPolling]
  );

  /**
   * Delete a video clip.
   */
  const handleDeleteClip = useCallback(
    async (clipId: string) => {
      try {
        await videoClipsApi.deleteVideoClip(project_id, clipId);
        invalidateClips();
        toast.success('Video clip deleted.');
      } catch {
        toast.error('Failed to delete video clip.');
      }
    },
    [project_id, invalidateClips]
  );

  const isClipGenerating = useCallback(
    (clipIdOrKey: string) => generatingClips.has(clipIdOrKey),
    [generatingClips]
  );

  const isAudioGenerating = useCallback(
    (clipId: string) => generatingAudio.has(clipId),
    [generatingAudio]
  );

  /**
   * Generate video clips for ALL keyframes in a scene at once.
   */
  const handleGenerateScene = useCallback(
    async (scene: Scene) => {
      const images = scene.reference_images || [];
      if (images.length === 0) {
        toast.error('This scene has no keyframe images.');
        return;
      }
      // Fire off all keyframe generations in parallel
      for (let i = 0; i < images.length; i++) {
        handleGenerateClip(scene, i);
      }
    },
    [handleGenerateClip]
  );

  return {
    config,
    setConfig,
    configDialogOpen,
    setConfigDialogOpen,
    handleGenerateClip,
    handleGenerateScene,
    handleGenerateAudio,
    handleDeleteClip,
    resumePolling,
    isClipGenerating,
    isAudioGenerating,
    generatingClips,
  };
}
