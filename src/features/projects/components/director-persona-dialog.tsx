'use client';

import { useState } from 'react';
import {
  Clapperboard,
  Check,
  Loader2,
  PenLine,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PRESET_PERSONAS } from '@/features/projects/constants';
import type { DirectorPersona } from '@/features/projects/types';

interface DirectorPersonaDialogProps {
  open: boolean;
  onClose: () => void;
  current_persona: DirectorPersona | null;
  onSelect: (persona: DirectorPersona) => void;
  is_loading: boolean;
}

export function DirectorPersonaDialog({
  open,
  onClose,
  current_persona,
  onSelect,
  is_loading,
}: DirectorPersonaDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    current_persona?.id ?? null
  );
  const [tab, setTab] = useState<'presets' | 'custom'>('presets');

  // Custom persona form
  const [customName, setCustomName] = useState('');
  const [customStyle, setCustomStyle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');

  function handlePresetSelect(id: string) {
    setSelectedId(id);
  }

  function handleConfirmPreset() {
    const persona = PRESET_PERSONAS.find((p) => p.id === selectedId);
    if (persona) onSelect(persona);
  }

  function handleConfirmCustom() {
    if (!customName.trim() || !customInstruction.trim()) return;
    const persona: DirectorPersona = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      style: customStyle.trim() || 'Custom Style',
      description: customDescription.trim(),
      system_instruction: customInstruction.trim(),
      is_custom: true,
    };
    onSelect(persona);
  }

  const canConfirmPreset = !!selectedId;
  const canConfirmCustom = !!customName.trim() && !!customInstruction.trim();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !is_loading && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Clapperboard className="h-5 w-5" />
            Choose Your Director
          </DialogTitle>
          <DialogDescription>
            Your Director Persona shapes how AI generates scripts, characters, scenes, and
            visuals. Pick a preset style or create your own.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as 'presets' | 'custom')}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 pt-5">
            <TabsList className="w-full">
              <TabsTrigger value="presets" className="flex-1 gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Preset Directors
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex-1 gap-1.5">
                <PenLine className="h-3.5 w-3.5" />
                Custom Director
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Presets Tab */}
          <TabsContent value="presets" className="flex-1 overflow-hidden mt-0 px-6 pt-4">
            <ScrollArea className="h-[380px] pr-3">
              <div className="grid grid-cols-2 gap-3 pb-6">
                {PRESET_PERSONAS.map((persona) => {
                  const isSelected = selectedId === persona.id;
                  const isCurrent = current_persona?.id === persona.id;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => handlePresetSelect(persona.id)}
                      className={`
                        relative text-left rounded-lg border p-4 transition-all
                        hover:border-primary/40 hover:bg-primary/5
                        ${isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                          : 'border-border bg-card'
                        }
                      `}
                    >
                      {isCurrent && (
                        <Badge
                          variant="secondary"
                          className="absolute top-2 right-2 text-[9px] px-1.5 py-0"
                        >
                          Current
                        </Badge>
                      )}
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {persona.name}
                          </p>
                          <p className="text-[11px] text-primary/70 font-medium">
                            {persona.style}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                          {persona.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute bottom-2 right-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Custom Tab */}
          <TabsContent value="custom" className="flex-1 overflow-hidden mt-0 px-6 pt-4">
            <ScrollArea className="h-[380px] pr-3 pb-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-name">Director Name *</Label>
                  <Input
                    id="custom-name"
                    placeholder="e.g. The Dreamweaver"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-style">Style Tag</Label>
                  <Input
                    id="custom-style"
                    placeholder="e.g. Surreal & Dreamlike"
                    value={customStyle}
                    onChange={(e) => setCustomStyle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-desc">Description</Label>
                  <Textarea
                    id="custom-desc"
                    placeholder="How would you describe this director's style in a sentence or two?"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    className="min-h-[60px] text-sm"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="custom-inst">System Instruction *</Label>
                  <Textarea
                    id="custom-inst"
                    placeholder="Give the AI explicit instructions on how to direct your film. For example: &#10;&#10;'You are directing a surrealist drama. Use non-linear timelines, symbolic imagery, and dialogue that blurs the line between dream and reality. Every scene should feel slightly disorienting but emotionally truthful.'"
                    value={customInstruction}
                    onChange={(e) => setCustomInstruction(e.target.value)}
                    className="min-h-[120px] text-sm font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    This instruction will be prepended to all AI prompts in this project — scripts, characters, scenes, and video generation.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="px-6 pb-6 pt-3 border-t">
          <Button variant="outline" onClick={onClose} disabled={is_loading}>
            Cancel
          </Button>
          {tab === 'presets' ? (
            <Button
              onClick={handleConfirmPreset}
              disabled={!canConfirmPreset || is_loading}
            >
              {is_loading ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="mr-2 h-3.5 w-3.5" />
              )}
              Set Director
            </Button>
          ) : (
            <Button
              onClick={handleConfirmCustom}
              disabled={!canConfirmCustom || is_loading}
            >
              {is_loading ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <PenLine className="mr-2 h-3.5 w-3.5" />
              )}
              Create & Set
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
