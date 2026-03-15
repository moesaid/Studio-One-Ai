'use client';

import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface ScriptAiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapterTitle: string | undefined;
  directorPersona: DirectorPersona | null;
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  isPending: boolean;
}

export function ScriptAiDialog({
  open,
  onOpenChange,
  chapterTitle,
  directorPersona,
  prompt,
  onPromptChange,
  onGenerate,
  isPending,
}: ScriptAiDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Content
          </DialogTitle>
          <DialogDescription>
            Describe what you want for &quot;{chapterTitle}&quot;.
            {directorPersona && (
              <span className="block mt-1 text-violet-400/70">
                Director: {directorPersona.name}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Textarea
            placeholder="e.g. Write the opening scene where the detective enters the abandoned warehouse..."
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onGenerate} disabled={!prompt.trim() || isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
