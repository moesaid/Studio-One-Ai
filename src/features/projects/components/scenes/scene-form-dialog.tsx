'use client';

import { useState } from 'react';
import {
  Loader2,
  Clapperboard,
  RefreshCw,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
  Palette,
  Video,
  Users,
  MessageSquare,
  Eye,
  Zap,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TIME_OF_DAY_OPTIONS, MOOD_OPTIONS } from '@/features/projects/constants/scenes';
import type { Scene, CreateScenePayload, Character } from '@/features/projects/types';
import { cn } from '@/lib/utils';

interface SceneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingScene: Scene | null;
  formData: CreateScenePayload;
  setFormData: (data: CreateScenePayload) => void;
  onSubmit: () => void;
  isPending: boolean;
  characters: Character[];
  onRegenerateImage?: (sceneId: string, imageIndex: number, note: string) => void;
  isRegenerating?: boolean;
}

/* ── Section header helper ── */
function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 pb-1">
      <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{label}</span>
    </div>
  );
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
  onRegenerateImage,
  isRegenerating,
}: SceneFormDialogProps) {
  const isEditing = !!editingScene;
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [regenNote, setRegenNote] = useState('');

  function updateField<K extends keyof CreateScenePayload>(key: K, value: CreateScenePayload[K]) {
    setFormData({ ...formData, [key]: value });
  }

  function toggleCharacter(name: string) {
    const current = formData.characters ?? [];
    const exists = current.includes(name);
    updateField('characters', exists ? current.filter((c) => c !== name) : [...current, name]);
  }

  const images = editingScene?.reference_images ?? [];
  const hasImages = images.length > 0;
  const activeIdx = selectedImageIndex ?? 0;
  const frameLabel = (i: number) => {
    if (i === 0) return 'Opening Shot';
    if (images.length > 1 && i === images.length - 1) return 'Close';
    return `Frame ${i + 1}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl! max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-1 ring-amber-500/20">
              <Clapperboard className="h-4 w-4 text-amber-400" />
            </div>
            <span className="text-base">{isEditing ? 'Edit Scene' : 'Add Scene'}</span>
            {isEditing && editingScene && (
              <Badge variant="outline" className="ml-1 text-[10px] text-muted-foreground font-mono">
                #{editingScene.order + 1}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update scene details, visual direction, and manage keyframe images.'
              : 'Define a new scene with location, mood, characters, and visual direction.'}
          </DialogDescription>
        </DialogHeader>

        {/* ── Main content — two-column in edit mode with images ── */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className={cn('grid gap-8', isEditing && hasImages ? 'grid-cols-[1fr,400px]' : 'grid-cols-1')}>

            {/* ══════════ Left Column: Form ══════════ */}
            <div className="space-y-6 py-1">

              {/* ── Title ── */}
              <div className="space-y-2">
                <Label htmlFor="scene-title" className="text-sm font-medium">Scene Title</Label>
                <Input
                  id="scene-title"
                  placeholder="e.g., The Confrontation at Dawn"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="h-10 text-sm"
                />
              </div>

              <Separator className="opacity-30" />

              {/* ── Setting: Location + Time + Mood ── */}
              <div className="space-y-3">
                <SectionHeader icon={MapPin} label="Setting" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="scene-location" className="text-xs text-muted-foreground">Location</Label>
                    <Input
                      id="scene-location"
                      placeholder="e.g., Dimly lit throne room"
                      value={formData.location ?? ''}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Time of Day
                    </Label>
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
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Palette className="h-3 w-3" /> Mood
                    </Label>
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
              </div>

              <Separator className="opacity-30" />

              {/* ── Story ── */}
              <div className="space-y-3">
                <SectionHeader icon={MessageSquare} label="Story" />
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="scene-description" className="text-xs text-muted-foreground">Description</Label>
                    <Textarea
                      id="scene-description"
                      placeholder="Brief logline — what is this scene about?"
                      value={formData.description ?? ''}
                      onChange={(e) => updateField('description', e.target.value)}
                      className="min-h-[72px] resize-none text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="scene-action" className="text-xs text-muted-foreground flex items-center gap-1">
                        <Zap className="h-3 w-3" /> Action
                      </Label>
                      <Textarea
                        id="scene-action"
                        placeholder="What physically happens — movement, gestures, events..."
                        value={formData.action ?? ''}
                        onChange={(e) => updateField('action', e.target.value)}
                        className="min-h-[88px] resize-none text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="scene-dialogue" className="text-xs text-muted-foreground">Key Dialogue</Label>
                      <Textarea
                        id="scene-dialogue"
                        placeholder={'CHARACTER: "Line of dialogue"\nCHARACTER: "Response..."'}
                        value={formData.dialogue ?? ''}
                        onChange={(e) => updateField('dialogue', e.target.value)}
                        className="min-h-[88px] resize-none text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="opacity-30" />

              {/* ── Visual Direction ── */}
              <div className="space-y-3">
                <SectionHeader icon={Eye} label="Visual Direction" />
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="scene-visual" className="text-xs text-muted-foreground">Visual Notes</Label>
                    <Textarea
                      id="scene-visual"
                      placeholder="Cinematographer-grade visual notes: blocking, lighting design, set design, color palette, atmosphere, practical/VFX elements..."
                      value={formData.visual_description ?? ''}
                      onChange={(e) => updateField('visual_description', e.target.value)}
                      className="min-h-[96px] resize-none text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="scene-camera" className="text-xs text-muted-foreground flex items-center gap-1">
                      <Video className="h-3 w-3" /> Camera Notes
                    </Label>
                    <Input
                      id="scene-camera"
                      placeholder="e.g., Opens wide establishing, tracks in to medium two-shot, cuts to tight close-up..."
                      value={formData.camera_notes ?? ''}
                      onChange={(e) => updateField('camera_notes', e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              {/* ── Characters ── */}
              {characters.length > 0 && (
                <>
                  <Separator className="opacity-30" />
                  <div className="space-y-3">
                    <SectionHeader icon={Users} label="Characters in Scene" />
                    <div className="flex flex-wrap gap-2 rounded-lg border border-border/30 bg-muted/10 p-3">
                      {characters.map((char) => {
                        const isSelected = (formData.characters ?? []).includes(char.name);
                        return (
                          <button
                            key={char.id}
                            type="button"
                            onClick={() => toggleCharacter(char.name)}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150',
                              isSelected
                                ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30 shadow-sm shadow-violet-500/10'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                            )}
                          >
                            <span className={cn(
                              'h-1.5 w-1.5 rounded-full transition-colors',
                              isSelected ? 'bg-violet-400' : 'bg-muted-foreground/30'
                            )} />
                            {char.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ══════════ Right Column: Image management (edit mode with images) ══════════ */}
            {isEditing && hasImages && (
              <div className="space-y-4 py-1">
                <SectionHeader icon={ImageIcon} label={`Scene Keyframes (${images.length})`} />

                {/* Main image viewer */}
                <div className="relative aspect-video rounded-xl overflow-hidden border border-border/30 bg-black/40 shadow-lg shadow-black/10">
                  <img
                    src={images[activeIdx]}
                    alt={`Scene frame ${activeIdx + 1}`}
                    className={cn('h-full w-full object-cover transition-opacity duration-300', isRegenerating && 'opacity-40')}
                  />

                  {/* Regenerating overlay */}
                  {isRegenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 backdrop-blur-[2px]">
                      <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                      <span className="text-xs font-medium text-white/90">Regenerating…</span>
                    </div>
                  )}

                  {/* Frame label */}
                  <span className="absolute top-2.5 left-2.5 rounded-md bg-black/60 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white/90 uppercase backdrop-blur-sm">
                    {frameLabel(activeIdx)}
                  </span>

                  {/* Counter */}
                  <span className="absolute top-2.5 right-2.5 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white/70 backdrop-blur-sm tabular-nums">
                    {activeIdx + 1} / {images.length}
                  </span>

                  {/* Navigation arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedImageIndex((prev) => ((prev ?? 0) - 1 + images.length) % images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedImageIndex((prev) => ((prev ?? 0) + 1) % images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail row */}
                <div className="flex gap-2">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImageIndex(i)}
                      className={cn(
                        'relative flex-1 aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200',
                        activeIdx === i
                          ? 'border-amber-400/70 ring-2 ring-amber-400/25 scale-[1.02]'
                          : 'border-border/20 hover:border-border/50 opacity-70 hover:opacity-100'
                      )}
                    >
                      <img src={url} alt={`Thumb ${i + 1}`} className="h-full w-full object-cover" />
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[8px] font-bold text-white/80 uppercase backdrop-blur-sm">
                        {frameLabel(i)}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Regenerate section */}
                <div className="space-y-3 rounded-xl border border-border/20 bg-gradient-to-b from-muted/10 to-muted/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                      </div>
                      <span className="text-xs font-medium text-foreground">Regenerate Keyframe</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] text-amber-400/80 border-amber-500/20">
                      {frameLabel(activeIdx)}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Re-generate the selected keyframe with optional art direction notes.
                  </p>
                  <Textarea
                    placeholder="Optional: e.g., warmer lighting, add rain, wider angle, darker mood..."
                    value={regenNote}
                    onChange={(e) => setRegenNote(e.target.value)}
                    className="min-h-[64px] resize-none text-xs"
                    disabled={isRegenerating}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 text-xs border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-300"
                    disabled={isRegenerating || !onRegenerateImage}
                    onClick={() => {
                      if (onRegenerateImage && editingScene) {
                        onRegenerateImage(editingScene.id, activeIdx, regenNote);
                        setRegenNote('');
                      }
                    }}
                  >
                    {isRegenerating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    {isRegenerating ? 'Regenerating…' : `Regenerate ${frameLabel(activeIdx)}`}
                  </Button>
                </div>
              </div>
            )}

            {/* No-images placeholder for edit mode */}
            {isEditing && !hasImages && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-amber-500/15 bg-gradient-to-b from-amber-500/[0.03] to-transparent py-16">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 ring-1 ring-amber-500/10 mb-4">
                  <Sparkles className="h-7 w-7 text-amber-400/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground/70">No keyframes yet</p>
                <p className="text-[11px] text-muted-foreground/40 mt-1.5 max-w-[200px] text-center leading-relaxed">
                  Run &quot;Auto-Split from Script&quot; to generate keyframe images for this scene.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/20">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isPending || !formData.title?.trim()}
            className="gap-1.5 bg-amber-600 hover:bg-amber-700"
          >
            {isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Add Scene'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
