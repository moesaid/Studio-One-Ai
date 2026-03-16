'use client';

import { Loader2, Clapperboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TIME_OF_DAY_OPTIONS, MOOD_OPTIONS } from '@/features/projects/constants/scenes';
import type { Scene, CreateScenePayload, Character } from '@/features/projects/types';

interface SceneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingScene: Scene | null;
  formData: CreateScenePayload;
  setFormData: (data: CreateScenePayload) => void;
  onSubmit: () => void;
  isPending: boolean;
  characters: Character[];
}

export function SceneFormDialog({
  open,
  onOpenChange,
  editingScene,
  formData,
  setFormData,
  onSubmit,
  isPending,
  characters,
}: SceneFormDialogProps) {
  const isEditing = !!editingScene;

  function updateField<K extends keyof CreateScenePayload>(key: K, value: CreateScenePayload[K]) {
    setFormData({ ...formData, [key]: value });
  }

  function toggleCharacter(name: string) {
    const current = formData.characters ?? [];
    const exists = current.includes(name);
    updateField('characters', exists ? current.filter((c) => c !== name) : [...current, name]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10">
              <Clapperboard className="h-3.5 w-3.5 text-amber-400" />
            </div>
            {isEditing ? 'Edit Scene' : 'Add Scene'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update scene details and visual direction.' : 'Define a new scene with location, mood, and characters.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="scene-title" className="text-xs">Title</Label>
            <Input
              id="scene-title"
              placeholder="e.g., The Confrontation"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="h-9"
            />
          </div>

          {/* Location + Time + Mood */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="scene-location" className="text-xs">Location</Label>
              <Input
                id="scene-location"
                placeholder="e.g., Dimly lit throne room"
                value={formData.location ?? ''}
                onChange={(e) => updateField('location', e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Time of Day</Label>
              <Select value={formData.time_of_day ?? 'day'} onValueChange={(v) => updateField('time_of_day', v as CreateScenePayload['time_of_day'])}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OF_DAY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Mood</Label>
              <Select value={formData.mood ?? 'dramatic'} onValueChange={(v) => updateField('mood', v as CreateScenePayload['mood'])}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="scene-description" className="text-xs">Visual Direction</Label>
            <Textarea
              id="scene-description"
              placeholder="Staging notes, visual direction, atmosphere..."
              value={formData.description ?? ''}
              onChange={(e) => updateField('description', e.target.value)}
              className="min-h-[70px] resize-none text-sm"
            />
          </div>

          {/* Action + Dialogue side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="scene-action" className="text-xs">Action</Label>
              <Textarea
                id="scene-action"
                placeholder="What physically happens in this scene..."
                value={formData.action ?? ''}
                onChange={(e) => updateField('action', e.target.value)}
                className="min-h-[70px] resize-none text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scene-dialogue" className="text-xs">Key Dialogue</Label>
              <Textarea
                id="scene-dialogue"
                placeholder="Important dialogue lines..."
                value={formData.dialogue ?? ''}
                onChange={(e) => updateField('dialogue', e.target.value)}
                className="min-h-[70px] resize-none text-sm"
              />
            </div>
          </div>

          {/* Camera notes */}
          <div className="space-y-1.5">
            <Label htmlFor="scene-camera" className="text-xs">Camera Notes</Label>
            <Input
              id="scene-camera"
              placeholder="e.g., Close-up on face, slow tracking shot..."
              value={formData.camera_notes ?? ''}
              onChange={(e) => updateField('camera_notes', e.target.value)}
              className="h-9"
            />
          </div>

          {/* Characters */}
          {characters.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs">Characters in Scene</Label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-md border border-border/40 bg-muted/20">
                {characters.map((char) => {
                  const isSelected = (formData.characters ?? []).includes(char.name);
                  return (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => toggleCharacter(char.name)}
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {char.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isPending || !formData.title?.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Add Scene'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
