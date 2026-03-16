'use client';

import { Play, Trash2, RefreshCw, Music, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  VEO_MODELS,
  VIDEO_DURATIONS,
  ASPECT_RATIOS,
  RESOLUTIONS,
} from '../../constants/video-clips';
import { VideoPreviewDialog } from './video-preview-dialog';
import type { VideoClip, Scene } from '../../types';

interface VideoConfig {
  video_model: string;
  duration: number;
  aspect_ratio: string;
  resolution: string;
  generate_audio: boolean;
}

interface VideoClipCardProps {
  clip: VideoClip;
  scene: Scene;
  isGenerating: boolean;
  isAudioGenerating: boolean;
  onRegenerate: (instruction?: string, configOverrides?: Partial<VideoConfig>) => void;
  onDelete: () => void;
  onGenerateAudio: () => void;
  /** Current global config — used as defaults for the regenerate dialog */
  currentConfig: VideoConfig;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'outline' },
  generating: { label: 'Generating…', variant: 'secondary' },
  done: { label: 'Complete', variant: 'default' },
  failed: { label: 'Failed', variant: 'destructive' },
};

export function VideoClipCard({
  clip,
  scene,
  isGenerating,
  isAudioGenerating,
  onRegenerate,
  onDelete,
  onGenerateAudio,
  currentConfig,
}: VideoClipCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [regenOpen, setRegenOpen] = useState(false);
  const [regenInstruction, setRegenInstruction] = useState('');
  const [regenConfig, setRegenConfig] = useState<VideoConfig>(currentConfig);
  const audioRef = useRef<HTMLAudioElement>(null);

  const statusInfo = STATUS_CONFIG[clip.status] || STATUS_CONFIG.pending;
  const keyframeImage = scene.reference_images?.[clip.keyframe_index];
  const frameLabel =
    clip.keyframe_index === 0
      ? 'Opening Shot'
      : clip.keyframe_index === (scene.reference_images?.length || 1) - 1
      ? 'Closing Shot'
      : `Frame ${clip.keyframe_index + 1}`;

  const handleOpenRegen = () => {
    setRegenConfig(currentConfig);
    setRegenInstruction('');
    setRegenOpen(true);
  };

  const handleRegenerate = () => {
    onRegenerate(regenInstruction.trim() || undefined, regenConfig);
    setRegenInstruction('');
    setRegenOpen(false);
  };

  const isInProgress = isGenerating || clip.status === 'generating';
  const isVeo3 = regenConfig.video_model.startsWith('veo-3');
  const selectedModel = VEO_MODELS.find((m) => m.id === regenConfig.video_model);

  return (
    <>
      <Card className="py-0 overflow-hidden group">
        <CardContent className="p-0">
          {/* Thumbnail area — clicking opens preview modal */}
          <div className="relative aspect-video bg-black/50">
            {clip.status === 'done' && clip.video_url ? (
              <>
                {/* Static thumbnail from the keyframe image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={keyframeImage || ''}
                  alt={scene.title}
                  className="h-full w-full object-cover"
                />
                {/* Play overlay — opens modal */}
                <button
                  onClick={() => setPreviewOpen(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="rounded-full bg-white/90 p-3 shadow-xl transition-transform group-hover:scale-110">
                    <Play className="h-6 w-6 text-gray-900 ml-0.5" />
                  </div>
                </button>
              </>
            ) : keyframeImage ? (
              <div className="relative h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={keyframeImage}
                  alt={scene.title}
                  className="h-full w-full object-cover"
                />
                {/* Generating overlay */}
                {isInProgress && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-300">
                      Generating video…
                    </span>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"
                          style={{ animationDelay: `${i * 300}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                No keyframe
              </div>
            )}

            {/* Status badge */}
            <Badge
              variant={statusInfo.variant}
              className="absolute top-2 left-2 text-[10px]"
            >
              {statusInfo.label}
            </Badge>

            {/* Duration badge */}
            {clip.status === 'done' && (
              <Badge
                variant="secondary"
                className="absolute top-2 right-2 text-[10px] bg-black/60 text-white border-0"
              >
                {clip.duration}s
              </Badge>
            )}
          </div>

          {/* Info & Actions */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground truncate">
                  {scene.title}
                </p>
                <p className="text-[10px] text-muted-foreground">{frameLabel}</p>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono">
                {clip.video_model.replace('-generate-001', '').replace('-generate', '')}
              </p>
            </div>

            {/* Error message */}
            {clip.status === 'failed' && clip.error_message && (
              <p className="text-[10px] text-destructive leading-tight">
                {clip.error_message}
              </p>
            )}

            {/* Audio section */}
            {clip.status === 'done' && (
              <div className="flex items-center gap-1.5">
                {clip.audio_url ? (
                  <div className="flex-1 flex items-center gap-2">
                    <audio ref={audioRef} src={clip.audio_url} className="hidden" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        if (audioRef.current) {
                          if (audioRef.current.paused) audioRef.current.play();
                          else audioRef.current.pause();
                        }
                      }}
                    >
                      <Music className="h-3 w-3" />
                    </Button>
                    <span className="text-[10px] text-muted-foreground">
                      Audio attached
                    </span>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] text-muted-foreground"
                    disabled={isAudioGenerating}
                    onClick={onGenerateAudio}
                  >
                    {isAudioGenerating ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Music className="mr-1 h-3 w-3" />
                    )}
                    {isAudioGenerating ? 'Generating…' : 'Generate Audio'}
                  </Button>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-1 pt-1">
              {clip.status === 'done' && clip.video_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px]"
                  onClick={() => setPreviewOpen(true)}
                >
                  <Play className="mr-1 h-3 w-3" />
                  Preview
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 flex-1 text-[11px]"
                disabled={isInProgress}
                onClick={handleOpenRegen}
                title="Regenerate with custom settings"
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Regenerate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                disabled={isInProgress}
                onClick={onDelete}
                title="Delete this video clip"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Video Preview Dialog ── */}
      {clip.status === 'done' && clip.video_url && (
        <VideoPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          video_url={clip.video_url}
          audio_url={clip.audio_url ?? undefined}
          title={scene.title}
          frame_label={frameLabel}
          duration={clip.duration}
          model={clip.video_model}
        />
      )}

      {/* ── Regenerate Dialog with full config ── */}
      <Dialog open={regenOpen} onOpenChange={setRegenOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Regenerate Video Clip</DialogTitle>
            <DialogDescription>
              Adjust settings and provide direction for{' '}
              <span className="font-medium text-foreground">{scene.title}</span>{' '}
              — {frameLabel}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Custom Instructions */}
            <div className="space-y-2">
              <Label htmlFor="regen-instruction" className="text-sm font-medium">
                Direction / Instructions
              </Label>
              <Textarea
                id="regen-instruction"
                value={regenInstruction}
                onChange={(e) => setRegenInstruction(e.target.value)}
                placeholder="e.g. Slow camera pan to the right, warmer tones, add fog…"
                className="min-h-[80px] text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Leave empty to regenerate with the original scene description.
              </p>
            </div>

            <Separator />

            {/* Model */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Video Model</Label>
              <Select
                value={regenConfig.video_model}
                onValueChange={(value: string | null) => {
                  if (value) setRegenConfig((c) => ({ ...c, video_model: value }));
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {VEO_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id} className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{model.label}</span>
                        {model.supports_audio && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                            Audio
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModel && (
                <p className="text-[11px] text-muted-foreground">
                  {selectedModel.description}
                </p>
              )}
            </div>

            {/* Duration & Aspect Ratio — side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Duration</Label>
                <Select
                  value={String(regenConfig.duration)}
                  onValueChange={(value) =>
                    setRegenConfig((c) => ({ ...c, duration: Number(value) }))
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VIDEO_DURATIONS.map((d) => (
                      <SelectItem key={d.value} value={String(d.value)} className="py-2">
                        <span className="text-sm">{d.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Aspect Ratio</Label>
                <Select
                  value={regenConfig.aspect_ratio}
                  onValueChange={(value: string | null) => {
                    if (value) setRegenConfig((c) => ({ ...c, aspect_ratio: value }));
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASPECT_RATIOS.map((a) => (
                      <SelectItem key={a.value} value={a.value} className="py-2">
                        <span className="text-sm">{a.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Resolution (Veo 3+) */}
            {isVeo3 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Resolution</Label>
                <Select
                  value={regenConfig.resolution}
                  onValueChange={(value: string | null) => {
                    if (value) setRegenConfig((c) => ({ ...c, resolution: value }));
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOLUTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value} className="py-2">
                        <span className="text-sm">{r.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Audio toggle (Veo 3+) */}
            {isVeo3 && (
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Built-in Audio</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Generate audio alongside video
                  </p>
                </div>
                <Switch
                  checked={regenConfig.generate_audio}
                  onCheckedChange={(checked) =>
                    setRegenConfig((c) => ({ ...c, generate_audio: checked }))
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRegenOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRegenerate}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
