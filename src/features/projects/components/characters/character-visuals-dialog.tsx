'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  Trash2,
  Sparkles,
  Loader2,
  X,
  UserCircle2,
  CheckCircle2,
  RefreshCw,
  ImagePlus,
  Check,
  MessageSquarePlus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import type { Character, Project } from '@/features/projects/types';
import { useGenerateCharacterVisualsMutation } from '@/features/ai/hooks/use-ai-query';
import {
  IMAGE_MODELS,
  getPreferredImageModel,
  setPreferredImageModel,
  type ImageModelId,
} from '@/lib/genai';
import {
  uploadGeneratedVisuals,
  deleteCharacterVisual,
  uploadCharacterVisualFile,
} from '@/features/projects/services/characters-api';
import { useQueryClient } from '@tanstack/react-query';

const EXPRESSION_LABELS: Record<string, string> = {
  neutral: 'Neutral',
  happy: 'Happy',
  serious: 'Serious',
  profile: 'Profile',
};

const EXPRESSION_IDS = Object.keys(EXPRESSION_LABELS);

interface CharacterVisualsDialogProps {
  character: Character | null;
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CharacterVisualsDialog({
  character,
  project,
  open,
  onOpenChange,
}: CharacterVisualsDialogProps) {
  const queryClient = useQueryClient();
  const refImageInputRef = useRef<HTMLInputElement>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [isUploadingRef, setIsUploadingRef] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Optimistic local images
  const [localImages, setLocalImages] = useState<string[]>([]);
  // Track deleted URLs so they're filtered from the stale prop
  const [deletedImages, setDeletedImages] = useState<Set<string>>(new Set());

  // Selection state
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [showCustomInstruction, setShowCustomInstruction] = useState(false);
  const [customInstruction, setCustomInstruction] = useState('');
  const [selectedModel, setSelectedModel] = useState<ImageModelId>(getPreferredImageModel());

  const generateMutation = useGenerateCharacterVisualsMutation();

  const invalidateCharacters = useCallback(() => {
    if (!character) return;
    queryClient.invalidateQueries({ queryKey: ['characters', character.project_id] });
  }, [queryClient, character]);

  // Merge prop images with optimistic local images, excluding deleted ones
  const images = useMemo(() => {
    const propImages = (character?.reference_images ?? []).filter((u) => !deletedImages.has(u));
    const merged = [...propImages];
    for (const url of localImages) {
      if (!merged.includes(url)) merged.push(url);
    }
    return merged;
  }, [character?.reference_images, localImages, deletedImages]);

  const hasImages = images.length > 0;
  const hasSelection = selectedIndices.size > 0;

  // Clear state when dialog closes
  useEffect(() => {
    if (!open) {
      setLocalImages([]);
      setDeletedImages(new Set());
      setGenerationProgress(0);
      setSelectedIndices(new Set());
      setShowCustomInstruction(false);
      setCustomInstruction('');
    }
  }, [open]);

  if (!character) return null;
  const isBusy = isGenerating || isDeleting !== null || isUploadingRef;

  /* ── Selection helpers ── */
  function toggleSelect(index: number) {
    if (isBusy) return;
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIndices(new Set());
    setShowCustomInstruction(false);
    setCustomInstruction('');
  }

  /* ── Reference image handling ── */
  function handleReferenceSelect(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    setReferenceFile(file);
    setReferencePreview(URL.createObjectURL(file));
  }

  function clearReference() {
    setReferenceFile(null);
    if (referencePreview) {
      URL.revokeObjectURL(referencePreview);
      setReferencePreview(null);
    }
  }

  async function handleUploadReference() {
    if (!referenceFile || !character) return;
    setIsUploadingRef(true);
    try {
      await uploadCharacterVisualFile(character.project_id, character.id, referenceFile);
      invalidateCharacters();
      clearReference();
      toast.success('Reference image saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploadingRef(false);
    }
  }

  /* ── Delete selected visuals ── */
  async function handleDeleteSelected() {
    if (!character || selectedIndices.size === 0) return;

    const urlsToDelete = Array.from(selectedIndices).map((i) => images[i]).filter(Boolean);
    if (urlsToDelete.length === 0) return;

    setIsDeleting('batch');
    try {
      for (const url of urlsToDelete) {
        await deleteCharacterVisual(character.project_id, character.id, url);
        // Remove from local additions and mark as deleted from prop
        setLocalImages((prev) => prev.filter((u) => u !== url));
        setDeletedImages((prev) => new Set(prev).add(url));
      }
      invalidateCharacters();
      toast.success(`${urlsToDelete.length} visual${urlsToDelete.length > 1 ? 's' : ''} removed`);
      clearSelection();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setIsDeleting(null);
    }
  }

  /* ── Generate / regenerate visuals ── */
  // replaceMap: { [imageIndex]: expressionId } — for in-place replacement
  async function handleGenerate(targetExpressions?: string[], replaceMap?: Map<number, string>) {
    if (!character) return;

    if (!character.appearance) {
      toast.error('Add an appearance description to this character first.');
      return;
    }

    // If regenerating selected images, delete the old ones first
    const replaceIndices = replaceMap ? Array.from(replaceMap.keys()).sort((a, b) => a - b) : [];
    if (replaceMap && replaceIndices.length > 0) {
      for (const idx of replaceIndices) {
        const url = images[idx];
        if (!url) continue;
        try {
          await deleteCharacterVisual(character.project_id, character.id, url);
          setLocalImages((prev) => prev.filter((u) => u !== url));
          setDeletedImages((prev) => new Set(prev).add(url));
        } catch {
          // Best effort
        }
      }
    }

    setIsGenerating(true);
    setGenerationProgress(10);
    clearSelection();

    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => Math.min(prev + 8, 85));
      }, 3000);

      const result = await generateMutation.mutateAsync({
        appearance: character.appearance,
        gender: character.gender,
        age: character.age,
        species: character.species,
        director_instruction: project?.director_persona?.system_instruction,
        film_style_prompt: project?.film_style?.image_prompt,
        expressions: targetExpressions,
        custom_instruction: customInstruction || undefined,
        model: selectedModel,
      });

      clearInterval(progressInterval);
      setGenerationProgress(90);

      if (result.data.images.length > 0) {
        const { data: uploadedUrls } = await uploadGeneratedVisuals(
          character.project_id,
          character.id,
          result.data.images
        );

        // In-place replacement: splice new URLs into the positions of old ones
        if (replaceMap && replaceIndices.length > 0 && uploadedUrls.length > 0) {
          setLocalImages((prev) => {
            // Build the current full image list (prop filtered + local)
            const propImages = (character.reference_images ?? []).filter((u) => !deletedImages.has(u));
            const current = [...propImages];
            for (const u of prev) {
              if (!current.includes(u)) current.push(u);
            }
            // Insert new URLs at the positions where old ones were
            const updated = [...current];
            for (let j = 0; j < Math.min(replaceIndices.length, uploadedUrls.length); j++) {
              const insertAt = replaceIndices[j];
              updated.splice(insertAt, 0, uploadedUrls[j]);
            }
            // Append any remaining new URLs
            for (let j = replaceIndices.length; j < uploadedUrls.length; j++) {
              updated.push(uploadedUrls[j]);
            }
            // Return only the new URLs (they'll merge with prop images in useMemo)
            return uploadedUrls;
          });
        } else {
          setLocalImages((prev) => [...prev, ...uploadedUrls]);
        }

        invalidateCharacters();
        toast.success(`${result.data.images.length} visual${result.data.images.length > 1 ? 's' : ''} generated!`);
      }

      setGenerationProgress(100);
      setCustomInstruction('');
      setShowCustomInstruction(false);
    } catch {
      // Error already handled by mutation hook toast
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 500);
    }
  }

  function handleRegenerateSelected() {
    // Map selected indices → expression IDs for regeneration
    const replaceMap = new Map<number, string>();
    for (const idx of selectedIndices) {
      const exprId = idx < EXPRESSION_IDS.length ? EXPRESSION_IDS[idx] : undefined;
      if (exprId) replaceMap.set(idx, exprId);
    }
    const exprs = Array.from(replaceMap.values());
    handleGenerate(exprs.length > 0 ? exprs : undefined, replaceMap.size > 0 ? replaceMap : undefined);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isGenerating) onOpenChange(v); }}>
      <DialogContent
        className="sm:max-w-[680px] max-h-[85vh] overflow-hidden flex flex-col"
        showCloseButton={!isGenerating}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400" />
            {character.name} — Character Visuals
          </DialogTitle>
          <DialogDescription>
            {hasImages
              ? 'Click images to select, then delete or regenerate them.'
              : 'Generate AI character visuals based on the appearance description.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pt-2 transition-all duration-300">
          {/* ── Generation progress ── */}
          {isGenerating && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                <span className="text-sm font-medium text-violet-300">
                  {hasImages ? 'Regenerating' : 'Generating'} character visuals…
                </span>
              </div>
              <Progress value={generationProgress} className="h-1.5" />
              <p className="text-[11px] text-muted-foreground">
                Creating expressions with consistent facial features. This may take up to a minute.
              </p>
            </div>
          )}

          {/* ── Gallery view ── */}
          {hasImages && !isGenerating && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
                  Character Sheet ({images.length} visuals)
                </span>
                <div className="flex items-center gap-2">
                  {hasSelection && (
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Deselect all
                    </button>
                  )}
                  {images.length >= 4 && !hasSelection && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Complete
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {images.map((url, i) => {
                  const isSelected = selectedIndices.has(i);
                  return (
                    <button
                      key={url}
                      type="button"
                      onClick={() => toggleSelect(i)}
                      disabled={isBusy}
                      className={`
                        group relative aspect-[3/4] rounded-xl overflow-hidden bg-muted/20
                        transition-all duration-200 cursor-pointer
                        ${isSelected
                          ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-background scale-[0.96]'
                          : 'border border-border/30 hover:border-border/60'
                        }
                        disabled:pointer-events-none disabled:opacity-60
                      `}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`${character.name} visual ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Selection check */}
                      <div className={`
                        absolute top-1.5 left-1.5 h-5 w-5 rounded-full flex items-center justify-center
                        transition-all duration-200
                        ${isSelected
                          ? 'bg-violet-500 text-white scale-100'
                          : 'bg-black/40 text-white/60 scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100'
                        }
                      `}>
                        <Check className="h-3 w-3" />
                      </div>
                      {/* Expression label */}
                      {i < EXPRESSION_IDS.length && (
                        <span className="absolute bottom-1.5 left-1.5 text-[8px] font-bold uppercase tracking-wider bg-black/60 text-white/80 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                          {EXPRESSION_LABELS[EXPRESSION_IDS[i]]}
                        </span>
                      )}
                      {/* Index badge */}
                      <span className="absolute top-1.5 right-1.5 text-[9px] font-bold bg-black/50 text-white/70 rounded-full h-5 w-5 flex items-center justify-center backdrop-blur-sm">
                        {i + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ── Selection action bar ── */}
              {hasSelection && (
                <div className="mt-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-violet-300">
                      {selectedIndices.size} visual{selectedIndices.size > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCustomInstruction(!showCustomInstruction)}
                        className="h-7 gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        <MessageSquarePlus className="h-3 w-3" />
                        {showCustomInstruction ? 'Hide' : 'Add'} instruction
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRegenerateSelected}
                        disabled={isBusy || !character.appearance}
                        className="h-7 gap-1 text-[11px] text-violet-400 border-violet-500/30 hover:bg-violet-500/10"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Regenerate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteSelected}
                        disabled={isBusy}
                        className="h-7 gap-1 text-[11px] text-red-400 border-red-500/30 hover:bg-red-500/10"
                      >
                        {isDeleting === 'batch' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                  {/* Custom instruction input */}
                  {showCustomInstruction && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-150">
                      <Textarea
                        value={customInstruction}
                        onChange={(e) => setCustomInstruction(e.target.value)}
                        placeholder="e.g. Make the lighting more dramatic, use a warmer color palette..."
                        className="h-16 text-xs resize-none bg-background/50"
                      />
                      <p className="text-[10px] text-muted-foreground/60">
                        Custom instruction applied when regenerating selected visuals
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Empty state ── */}
          {!hasImages && !isGenerating && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <ImagePlus className="h-7 w-7 text-violet-400/60" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground/70">
                  No visuals yet
                </p>
                <p className="text-xs text-muted-foreground max-w-[280px]">
                  Generate 4 expressions — neutral, happy, serious, and profile — to build a consistent character sheet.
                </p>
              </div>
              <Button
                onClick={() => handleGenerate()}
                disabled={!character.appearance}
                className="gap-1.5 bg-violet-600 hover:bg-violet-700"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generate Character Sheet
              </Button>
            {!character.appearance && (
                <p className="text-[10px] text-amber-400/70">
                  Add an appearance description to this character first.
                </p>
              )}
            </div>
          )}

          {/* ── Model selector ── */}
          <div className="rounded-xl border border-border/20 bg-muted/5 p-3 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
              Image Model
            </span>
            <select
              value={selectedModel}
              onChange={(e) => {
                const id = e.target.value as ImageModelId;
                setSelectedModel(id);
                setPreferredImageModel(id);
              }}
              disabled={isGenerating}
              className="w-full h-9 rounded-lg border border-border/30 bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50 disabled:opacity-50 cursor-pointer"
            >
              {IMAGE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} — {m.description}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground/50">
              Select an Imagen model from Vertex AI. The app will try other models as fallback if the selected one fails.
            </p>
          </div>

          {/* ── Face reference upload ── */}
          <div className="rounded-xl border border-border/20 bg-muted/5 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
                Face Reference (optional)
              </span>
              {referenceFile && (
                <button
                  type="button"
                  onClick={clearReference}
                  disabled={isGenerating}
                  className="text-[10px] text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
            {referencePreview ? (
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-border/30 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={referencePreview}
                    alt="Face reference"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground/70 truncate">{referenceFile?.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Reference for facial features
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUploadReference}
                  disabled={isBusy}
                  className="flex-shrink-0 text-[11px] h-7"
                >
                  {isUploadingRef ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => refImageInputRef.current?.click()}
                disabled={isGenerating}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg border border-dashed border-border/30 hover:border-border/50 transition-colors group cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="h-10 w-10 rounded-lg bg-muted/20 flex items-center justify-center flex-shrink-0 group-hover:bg-muted/30 transition-colors">
                  <UserCircle2 className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-foreground/60">Upload a face photo</p>
                  <p className="text-[10px] text-muted-foreground/50">
                    Optional — helps maintain facial features across visuals
                  </p>
                </div>
              </button>
            )}
            <input
              ref={refImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleReferenceSelect(e.target.files)}
            />
          </div>

          {/* ── Appearance context ── */}
          {character.appearance && (
            <div className="rounded-lg border border-border/20 bg-muted/10 px-3 py-2.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
                Appearance Notes
              </span>
              <p className="text-[11px] text-foreground/50 leading-relaxed mt-0.5">
                {character.appearance}
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center gap-2 pt-4 border-t border-border/20">
          {hasImages && !isGenerating && !hasSelection && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGenerate()}
              disabled={isBusy || !character.appearance}
              className="gap-1.5 text-violet-400 border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate All
            </Button>
          )}

          <div className="ml-auto">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={isGenerating}>
              <X className="h-3.5 w-3.5 mr-1" />
              {isGenerating ? 'Generating…' : 'Close'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
