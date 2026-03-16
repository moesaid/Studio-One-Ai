'use client';

import { Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ROLE_CONFIG } from '@/features/projects/constants/characters';
import type { Character } from '@/features/projects/types';

interface CharacterDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targets: Character[];
  onConfirm: () => void;
  isDeleting: boolean;
}

export function CharacterDeleteDialog({
  open,
  onOpenChange,
  targets,
  onConfirm,
  isDeleting,
}: CharacterDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-4 w-4 text-destructive" />
            </div>
            {targets.length > 1 ? `Delete ${targets.length} Characters` : 'Delete Character'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <span className="block">
              {targets.length > 1
                ? 'The following characters will be permanently removed from your project:'
                : 'Are you sure you want to permanently delete this character?'}
            </span>
            <span className="block rounded-lg border border-border/30 bg-muted/30 px-3 py-2">
              {targets.map((c, i) => (
                <span key={c.id} className="inline-flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${ROLE_CONFIG[c.role]?.accent ?? 'from-zinc-500 to-zinc-600'}`} />
                  <span className="font-medium text-foreground">{c.name}</span>
                  <span className="text-muted-foreground/50 text-xs">({ROLE_CONFIG[c.role]?.label})</span>
                  {i < targets.length - 1 && <span className="text-muted-foreground/30 mr-1">,</span>}
                </span>
              ))}
            </span>
            <span className="block text-xs text-destructive/70">This action cannot be undone.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isDeleting && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />} Delete{targets.length > 1 ? ` ${targets.length} Characters` : ''}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
