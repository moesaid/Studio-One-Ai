'use client';

import { Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { DirectorPersona } from '@/features/projects/types';

interface ScriptFullGenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  directorPersona: DirectorPersona | null;
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export function ScriptFullGenDialog({
  open,
  onOpenChange,
  directorPersona,
  prompt,
  onPromptChange,
  onGenerate,
  isLoading,
}: ScriptFullGenDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isLoading) onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Generate Full Script
          </DialogTitle>
          <DialogDescription>
            Describe your story concept, plot, or screenplay idea. The AI will generate a
            complete chapter structure with screenplay content.
            {directorPersona && (
              <span className="block mt-2 text-violet-400/70 font-medium">
                🎬 Directed by {directorPersona.name} — {directorPersona.style}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="full-gen-prompt">Storyline / Description</Label>
            <Textarea
              id="full-gen-prompt"
              placeholder="e.g. A noir thriller set in 1940s Los Angeles. A private detective is hired to find a missing heiress, but the case leads him into a web of corruption involving the city's water supply..."
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              className="min-h-[160px] text-sm"
              disabled={isLoading}
            />
            <p className="text-[11px] text-muted-foreground">
              The more detail you provide, the richer the generated screenplay will be.
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center gap-3 rounded-lg bg-violet-500/10 border border-violet-500/20 p-3">
              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-violet-300">Generating your screenplay...</p>
                <p className="text-[11px] text-violet-400/70">This may take 30-60 seconds depending on the story scope.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={onGenerate}
            disabled={!prompt.trim() || isLoading}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-3.5 w-3.5" />
                Generate Script
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
