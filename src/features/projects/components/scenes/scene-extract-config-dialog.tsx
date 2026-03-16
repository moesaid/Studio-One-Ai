'use client';

import { useState } from 'react';
import { Sparkles, Settings2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  IMAGE_MODELS,
  IMAGE_MODEL,
  getPreferredImageModel,
  setPreferredImageModel,
  type ImageModelId,
} from '@/lib/genai';

export interface ExtractConfig {
  instruction: string;
  scene_count: number; // 0 = auto-detect
  images_per_scene: number;
  image_model: string;
}

const DEFAULT_CONFIG: ExtractConfig = {
  instruction: '',
  scene_count: 0,
  images_per_scene: 2,
  image_model: getPreferredImageModel(),
};

interface SceneExtractConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (config: ExtractConfig) => void;
}

export function SceneExtractConfigDialog({
  open,
  onOpenChange,
  onConfirm,
}: SceneExtractConfigDialogProps) {
  const [config, setConfig] = useState<ExtractConfig>({ ...DEFAULT_CONFIG });

  function handleConfirm() {
    // Persist model preference
    if (IMAGE_MODELS.some((m) => m.id === config.image_model)) {
      setPreferredImageModel(config.image_model as ImageModelId);
    }
    onConfirm(config);
    onOpenChange(false);
  }

  function handleOpenChange(v: boolean) {
    if (v) {
      // Reset to defaults when opening
      setConfig({ ...DEFAULT_CONFIG, image_model: getPreferredImageModel() });
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-amber-400" />
            Auto-Split Settings
          </DialogTitle>
          <DialogDescription>
            Configure how AI splits your screenplay into scenes and generates visuals.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* ── Custom instruction ── */}
          <div className="space-y-2">
            <Label htmlFor="extract-instruction" className="text-xs font-medium">
              Custom Instructions <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="extract-instruction"
              value={config.instruction}
              onChange={(e) => setConfig((p) => ({ ...p, instruction: e.target.value }))}
              placeholder="e.g. Focus on action sequences, keep dialogue-heavy scenes short, emphasize outdoor locations..."
              className="h-20 text-xs resize-none"
            />
          </div>

          {/* ── Scene count + Images per scene — side by side ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scene-count" className="text-xs font-medium">
                Target Scenes
              </Label>
              <Input
                id="scene-count"
                type="number"
                min={0}
                max={100}
                value={config.scene_count || ''}
                onChange={(e) =>
                  setConfig((p) => ({ ...p, scene_count: parseInt(e.target.value) || 0 }))
                }
                placeholder="Auto"
                className="h-9 text-sm"
              />
              <p className="text-[10px] text-muted-foreground/60">
                Leave empty for auto-detect
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images-per-scene" className="text-xs font-medium">
                Images per Scene
              </Label>
              <Select
                value={String(config.images_per_scene)}
                onValueChange={(v) => {
                  if (v != null) setConfig((p) => ({ ...p, images_per_scene: parseInt(v) || 0 }));
                }}
              >
                <SelectTrigger id="images-per-scene" className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None (text only)</SelectItem>
                  <SelectItem value="1">1 image</SelectItem>
                  <SelectItem value="2">2 images</SelectItem>
                  <SelectItem value="3">3 images</SelectItem>
                  <SelectItem value="4">4 images</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground/60">
                Keyframe images per scene
              </p>
            </div>
          </div>

          {/* ── Image model ── */}
          <div className="space-y-2">
            <Label htmlFor="image-model" className="text-xs font-medium">
              Image Generation Model
            </Label>
            <Select
              value={config.image_model}
              onValueChange={(v) => {
                if (v != null) setConfig((p) => ({ ...p, image_model: v }));
              }}
            >
              <SelectTrigger id="image-model" className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-[--radix-select-trigger-width]">
                {IMAGE_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label} — {m.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/20">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-amber-600 hover:bg-amber-700"
            onClick={handleConfirm}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Start Extraction
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
