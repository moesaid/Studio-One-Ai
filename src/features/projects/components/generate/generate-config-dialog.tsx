'use client';

import { Settings2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  VEO_MODELS,
  VIDEO_DURATIONS,
  ASPECT_RATIOS,
  RESOLUTIONS,
} from '../../constants/video-clips';

interface VideoConfig {
  video_model: string;
  duration: number;
  aspect_ratio: string;
  resolution: string;
  generate_audio: boolean;
}

interface GenerateConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: VideoConfig;
  onConfigChange: (config: VideoConfig) => void;
  onConfirm: () => void;
}

export function GenerateConfigDialog({
  open,
  onOpenChange,
  config,
  onConfigChange,
  onConfirm,
}: GenerateConfigDialogProps) {
  const selectedModel = VEO_MODELS.find((m) => m.id === config.video_model);
  const isVeo3 = config.video_model.startsWith('veo-3');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Settings2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-base">Video Generation Settings</DialogTitle>
              <DialogDescription className="text-xs">
                Configure model, quality, and format for video generation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Video Model */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Video Model</Label>
            <Select
              value={config.video_model}
              onValueChange={(value: string | null) => {
                if (value) onConfigChange({ ...config, video_model: value });
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
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedModel.description}
              </p>
            )}
          </div>

          <Separator />

          {/* Duration & Aspect Ratio — side by side */}
          <div className="grid grid-cols-2 gap-4">
            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Duration</Label>
              <Select
                value={String(config.duration)}
                onValueChange={(value) =>
                  onConfigChange({ ...config, duration: Number(value) })
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

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Aspect Ratio</Label>
              <Select
                value={config.aspect_ratio}
                onValueChange={(value: string | null) => {
                  if (value) onConfigChange({ ...config, aspect_ratio: value });
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

          {/* Resolution (Veo 3+ only) */}
          {isVeo3 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Resolution</Label>
              <Select
                value={config.resolution}
                onValueChange={(value: string | null) => {
                  if (value) onConfigChange({ ...config, resolution: value });
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

          {/* Generate Audio toggle (Veo 3+ only) */}
          {isVeo3 && (
            <>
              <Separator />
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Built-in Audio</Label>
                  <p className="text-xs text-muted-foreground">
                    Generate audio alongside video (Veo 3+)
                  </p>
                </div>
                <Switch
                  checked={config.generate_audio}
                  onCheckedChange={(checked) =>
                    onConfigChange({ ...config, generate_audio: checked })
                  }
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
