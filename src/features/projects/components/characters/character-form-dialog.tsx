'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagInput } from './tag-input';
import { ROLE_CONFIG, ROLES } from '@/features/projects/constants/characters';
import type { Character, CharacterRole, CharacterGender, CharacterSpecies, CreateCharacterPayload } from '@/features/projects/types';

interface CharacterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCharacter: Character | null;
  formData: CreateCharacterPayload;
  setFormData: (data: CreateCharacterPayload) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function CharacterFormDialog({
  open,
  onOpenChange,
  editingCharacter,
  formData,
  setFormData,
  onSubmit,
  isPending,
}: CharacterFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl!">
        <DialogHeader>
          <DialogTitle className="text-base">
            {editingCharacter ? 'Edit Character' : 'Add Character'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          <div className="grid grid-cols-2 gap-6 py-2 pr-4">
            {/* ── LEFT COLUMN: Identity & Story ── */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Identity</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Name</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Character name" className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Role</Label>
                      <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as CharacterRole })}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r} className="text-sm">{ROLE_CONFIG[r].label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Species</Label>
                      <Select value={formData.species ?? 'human'} onValueChange={(v) => setFormData({ ...formData, species: v as CharacterSpecies })}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="human" className="text-sm">🧑 Human</SelectItem>
                          <SelectItem value="animal" className="text-sm">🐾 Animal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Gender</Label>
                      <Select value={formData.gender ?? 'male'} onValueChange={(v) => setFormData({ ...formData, gender: v as CharacterGender })}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male" className="text-sm">Male</SelectItem>
                          <SelectItem value="female" className="text-sm">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Age</Label>
                      <Input type="number" min={1} max={150} value={formData.age ?? 25} onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 25 })} className="h-9 text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Story</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Description</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Who they are at their core — personality, worldview, defining qualities..." className="text-sm resize-none" rows={3} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Arc</Label>
                    <Textarea value={formData.arc} onChange={(e) => setFormData({ ...formData, arc: e.target.value })} placeholder="e.g., Goes from self-doubt to confident leader through trials..." className="text-sm resize-none" rows={2} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Backstory</Label>
                    <Textarea value={formData.backstory} onChange={(e) => setFormData({ ...formData, backstory: e.target.value })} placeholder="Background and history that shaped who they are..." className="text-sm resize-none" rows={3} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Appearance, Voice & Traits ── */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Appearance & Voice</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Appearance</Label>
                    <Textarea value={formData.appearance} onChange={(e) => setFormData({ ...formData, appearance: e.target.value })} placeholder="Physical description — build, hair, eyes, clothing, distinguishing features..." className="text-sm resize-none" rows={3} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Voice</Label>
                    <Textarea value={formData.voice} onChange={(e) => setFormData({ ...formData, voice: e.target.value })} placeholder="How they speak — tone, vocabulary, speech patterns, accent..." className="text-sm resize-none" rows={2} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Vibe</Label>
                    <Input value={formData.vibe} onChange={(e) => setFormData({ ...formData, vibe: e.target.value })} placeholder="One-liner capturing their energy..." className="h-9 text-sm" />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Character Depth</p>
                <div className="space-y-3">
                  <TagInput label="Traits" values={formData.traits ?? []} onChange={(v) => setFormData({ ...formData, traits: v })} placeholder="Type a trait and press Enter..." />
                  <TagInput label="Motivations" values={formData.motivations ?? []} onChange={(v) => setFormData({ ...formData, motivations: v })} placeholder="What drives them? Press Enter..." />
                  <TagInput label="Flaws" values={formData.flaws ?? []} onChange={(v) => setFormData({ ...formData, flaws: v })} placeholder="Internal weaknesses. Press Enter..." />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={onSubmit} disabled={!formData.name.trim() || isPending}>
            {isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
            {editingCharacter ? 'Save Changes' : 'Create Character'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
