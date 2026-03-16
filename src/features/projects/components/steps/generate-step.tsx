'use client';

import { useEffect } from 'react';
import { Wand2, Zap, Settings2, Loader2, Film, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { GenerateStepProps, Scene, VideoClip } from '../../types';
import { useScenesQuery } from '../../hooks/use-scenes-query';
import { useVideoClipsQuery } from '../../hooks/use-video-clips-query';
import { useVideoClips } from '../../hooks/use-video-clips';
import { VideoClipCard } from '../generate/video-clip-card';
import { GenerateConfigDialog } from '../generate/generate-config-dialog';

/* ── Generate Step — Video Clips from Scene Keyframes ── */

export function GenerateStep({
  project_id,
  project_title,
  project_description,
  director_persona,
  film_style,
}: GenerateStepProps) {
  const { data: scenes = [], isLoading: scenesLoading } = useScenesQuery(project_id);
  const { data: clips = [], isLoading: clipsLoading } = useVideoClipsQuery(project_id);

  const vc = useVideoClips({ project_id, director_persona, film_style });

  // Resume polling for any in-progress clips on mount
  useEffect(() => {
    if (clips.length > 0) {
      vc.resumePolling(clips);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clips]);

  const isLoading = scenesLoading || clipsLoading;

  // Scenes with keyframes (ready for video generation)
  const readyScenes = scenes.filter(
    (s: Scene) => s.reference_images && s.reference_images.length > 0
  );

  // Group clips by scene
  const clipsByScene = clips.reduce<Record<string, VideoClip[]>>((acc, clip: VideoClip) => {
    if (!acc[clip.scene_id]) acc[clip.scene_id] = [];
    acc[clip.scene_id].push(clip);
    return acc;
  }, {});

  /* Loading */
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* Empty — no scenes with keyframes */
  if (readyScenes.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Wand2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Generate</h2>
              <p className="text-xs text-muted-foreground">
                AI-generate video clips for your scenes
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <Card className="py-0 max-w-md">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 ring-1 ring-emerald-500/10">
                  <Film className="h-6 w-6 text-emerald-400/70" strokeWidth={1.5} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-foreground">
                    No Scenes Ready
                  </h3>
                  <p className="max-w-sm text-xs text-muted-foreground leading-relaxed">
                    Generate keyframe images for your scenes first. Once scenes have
                    images, you&apos;ll be able to convert them into video clips.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* Main view */
  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Wand2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Generate</h2>
              <p className="text-xs text-muted-foreground">
                {readyScenes.length} scene{readyScenes.length !== 1 ? 's' : ''} ready
                {' · '}
                {clips.length} clip{clips.length !== 1 ? 's' : ''} generated
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Config button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => vc.setConfigDialogOpen(true)}
            >
              <Settings2 className="mr-2 h-3.5 w-3.5" />
              Settings
            </Button>

            {/* Generate All button */}
            <Button
              size="sm"
              disabled={vc.generatingClips.size > 0}
              onClick={() => vc.setConfigDialogOpen(true)}
            >
              <Zap className="mr-2 h-3.5 w-3.5" />
              Generate All
            </Button>
          </div>
        </div>

        {/* Config info bar */}
        <div className="flex items-center gap-3 border-b border-border/30 bg-muted/30 px-6 py-2">
          <Badge variant="outline" className="text-[10px] font-normal">
            {vc.config.video_model.replace('-generate-001', '').replace('-fast', ' Fast')}
          </Badge>
          <Badge variant="outline" className="text-[10px] font-normal">
            {vc.config.duration}s
          </Badge>
          <Badge variant="outline" className="text-[10px] font-normal">
            {vc.config.aspect_ratio}
          </Badge>
          {vc.config.video_model.startsWith('veo-3') && (
            <Badge variant="outline" className="text-[10px] font-normal">
              {vc.config.resolution}
            </Badge>
          )}
          {vc.config.generate_audio && vc.config.video_model.startsWith('veo-3') && (
            <Badge variant="secondary" className="text-[10px] font-normal">
              <Music className="mr-1 h-2.5 w-2.5" />
              Audio ON
            </Badge>
          )}
        </div>

        {/* Scene list with clips */}
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-6xl space-y-8">
            {readyScenes.map((scene: Scene, sceneIdx: number) => {
              const sceneClips = clipsByScene[scene.id] || [];

              return (
                <div key={scene.id} className="space-y-3">
                  {/* Scene header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                        {sceneIdx + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-foreground">
                          {scene.title}
                        </h3>
                        <p className="text-[10px] text-muted-foreground">
                          {scene.reference_images?.length || 0} keyframe{(scene.reference_images?.length || 0) !== 1 ? 's' : ''}
                          {' · '}
                          {sceneClips.length} clip{sceneClips.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Per-keyframe grid — shows a card for every keyframe */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {(scene.reference_images || []).map((imgUrl: string, kfIdx: number) => {
                      // Find existing clip for this keyframe
                      const clip = sceneClips.find(
                        (c: VideoClip) => c.keyframe_index === kfIdx
                      );

                      if (clip) {
                        // Clip exists — show the VideoClipCard
                        return (
                          <VideoClipCard
                            key={clip.id}
                            clip={clip}
                            scene={scene}
                            isGenerating={vc.isClipGenerating(clip.id)}
                            isAudioGenerating={vc.isAudioGenerating(clip.id)}
                            currentConfig={vc.config}
                            onRegenerate={(instruction, configOverrides) =>
                              vc.handleGenerateClip(scene, kfIdx, instruction, configOverrides)
                            }
                            onDelete={() => vc.handleDeleteClip(clip.id)}
                            onGenerateAudio={() => vc.handleGenerateAudio(scene, clip)}
                          />
                        );
                      }

                      // No clip yet — show keyframe preview with generate button
                      const frameLabel =
                        kfIdx === 0
                          ? 'Opening Shot'
                          : kfIdx === (scene.reference_images?.length || 1) - 1
                          ? 'Closing Shot'
                          : `Frame ${kfIdx + 1}`;

                      return (
                        <Card
                          key={`kf-${kfIdx}`}
                          className="py-0 overflow-hidden group/kf cursor-pointer"
                          onClick={() => vc.handleGenerateClip(scene, kfIdx)}
                        >
                          <CardContent className="p-0">
                            <div className="relative aspect-video">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imgUrl}
                                alt={`${scene.title} ${frameLabel}`}
                                className="h-full w-full object-cover"
                              />
                              {vc.isClipGenerating(`${scene.id}-${kfIdx}`) ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 backdrop-blur-sm">
                                  <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                                  <span className="text-[10px] text-emerald-300 font-medium">
                                    Generating…
                                  </span>
                                </div>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/kf:opacity-100 transition-opacity">
                                  <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-gray-900 shadow-lg">
                                    <Wand2 className="h-3 w-3" />
                                    Generate Video
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="px-2 py-1.5">
                              <p className="text-[10px] text-muted-foreground">
                                {frameLabel}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {sceneIdx < readyScenes.length - 1 && <Separator className="mt-4" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Config Dialog */}
        <GenerateConfigDialog
          open={vc.configDialogOpen}
          onOpenChange={vc.setConfigDialogOpen}
          config={vc.config}
          onConfigChange={vc.setConfig}
          onConfirm={() => {
            vc.setConfigDialogOpen(false);
          }}
        />
      </div>
    </TooltipProvider>
  );
}
