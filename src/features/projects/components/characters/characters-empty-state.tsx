'use client';

import { Users, UserPlus, Plus, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CharacterFormDialog } from './character-form-dialog';
import { CharacterExtractDialog } from './character-extract-dialog';
import type { Character, CreateCharacterPayload } from '@/features/projects/types';

interface CharactersEmptyStateProps {
  hasChapters: boolean;
  extractLoading: boolean;
  extractStep: number;
  onExtract: () => void;
  onAdd: () => void;
  /* Form dialog props */
  formOpen: boolean;
  onFormOpenChange: (open: boolean) => void;
  editingCharacter: Character | null;
  formData: CreateCharacterPayload;
  setFormData: (data: CreateCharacterPayload) => void;
  onFormSubmit: () => void;
  isFormPending: boolean;
}

export function CharactersEmptyState({
  hasChapters,
  extractLoading,
  extractStep,
  onExtract,
  onAdd,
  formOpen,
  onFormOpenChange,
  editingCharacter,
  formData,
  setFormData,
  onFormSubmit,
  isFormPending,
}: CharactersEmptyStateProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
            <Users className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Characters</h2>
            <p className="text-[11px] text-muted-foreground">0 characters</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 ring-1 ring-violet-500/10">
            <UserPlus className="h-7 w-7 text-violet-400/60" strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-foreground">No Characters Yet</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {hasChapters ? 'Extract characters from your script using AI, or add them manually.' : 'Write your script first, then extract characters automatically with AI.'}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {hasChapters && (
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={onExtract} disabled={extractLoading}>
                {extractLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                Extract from Script
              </Button>
            )}
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={onAdd}>
              <Plus className="h-3 w-3" /> Add Manually
            </Button>
          </div>
        </div>
      </div>

      <CharacterFormDialog
        open={formOpen}
        onOpenChange={onFormOpenChange}
        editingCharacter={editingCharacter}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onFormSubmit}
        isPending={isFormPending}
      />

      <CharacterExtractDialog
        open={extractLoading}
        currentStep={extractStep}
      />
    </div>
  );
}
