'use client';

import { ScrollText, Save, Sparkles, Loader2, FileText, Wand2 } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateScriptMutation } from '@/features/projects';
import { useGenerateTextMutation } from '@/features/ai/hooks/use-ai-query';

interface ScriptStepProps {
  project_id: string;
  initial_script: string;
}

export function ScriptStep({ project_id, initial_script }: ScriptStepProps) {
  const [script, setScript] = useState(initial_script);
  const [hasChanges, setHasChanges] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const saveMutation = useUpdateScriptMutation();
  const generateMutation = useGenerateTextMutation();

  // Sync when the project data reloads
  useEffect(() => {
    setScript(initial_script);
    setHasChanges(false);
  }, [initial_script]);

  const handleChange = useCallback(
    (value: string) => {
      setScript(value);
      setHasChanges(value !== initial_script);
    },
    [initial_script]
  );

  const handleSave = useCallback(() => {
    saveMutation.mutate(
      { id: project_id, script },
      {
        onSuccess: () => {
          setHasChanges(false);
        },
      }
    );
  }, [project_id, script, saveMutation]);

  const handleGenerate = useCallback(() => {
    if (!aiPrompt.trim()) return;

    generateMutation.mutate(
      {
        prompt: aiPrompt.trim(),
        system_instruction:
          'You are a professional screenwriter. Write a screenplay/script based on the user\'s prompt. Use standard screenplay format with scene headings (INT./EXT.), action lines, character names in caps, and dialogue. Be creative, detailed, and cinematic. Do not include any markdown formatting — output plain text only.',
      },
      {
        onSuccess: (data) => {
          const generated = data.data.text;
          // If there's existing content, append with a separator
          if (script.trim()) {
            handleChange(script + '\n\n--- AI GENERATED ---\n\n' + generated);
          } else {
            handleChange(generated);
          }
          setAiDialogOpen(false);
          setAiPrompt('');
        },
      }
    );
  }, [aiPrompt, script, generateMutation, handleChange]);

  // Word and character counts
  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
  const charCount = script.length;

  return (
    <div className="flex h-full flex-col">
      {/* Step header */}
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <ScrollText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Script</h2>
            <p className="text-xs text-muted-foreground">Write your screenplay or generate with AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30 bg-amber-500/5">
              Unsaved changes
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAiDialogOpen(true)}
          >
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            AI Assist
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-2 h-3.5 w-3.5" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto">
        {script.trim() || hasChanges ? (
          /* Active editor */
          <div className="h-full flex flex-col">
            <textarea
              ref={textareaRef}
              value={script}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="INT. LIVING ROOM — DAY

A dimly lit room. SARAH (30s) sits at a cluttered desk, staring at a blank screen...

Write your screenplay here..."
              className="flex-1 w-full resize-none bg-transparent px-8 py-6 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              spellCheck
            />
            {/* Status bar */}
            <div className="flex items-center justify-between border-t border-border/50 px-6 py-2">
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                <span>{wordCount.toLocaleString()} words</span>
                <Separator orientation="vertical" className="h-3" />
                <span>{charCount.toLocaleString()} characters</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                {saveMutation.isPending
                  ? 'Saving...'
                  : hasChanges
                  ? 'Unsaved changes'
                  : 'All changes saved'}
              </div>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center max-w-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 ring-1 ring-blue-500/10">
                <FileText className="h-6 w-6 text-blue-400/70" strokeWidth={1.5} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">Start Your Script</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Write your screenplay directly in the editor, or use AI Assist to generate a script from
                  a description of your story.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleChange(' ');
                    handleChange('');
                    textareaRef.current?.focus();
                  }}
                >
                  <FileText className="mr-2 h-3.5 w-3.5" />
                  Start Writing
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAiDialogOpen(true)}
                >
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Generate with AI
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Generation Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              AI Script Generation
            </DialogTitle>
            <DialogDescription>
              Describe your story, and AI will generate a professional screenplay for you.
              {script.trim() && ' The generated text will be appended to your existing script.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Story Description</Label>
              <Textarea
                id="ai-prompt"
                placeholder="e.g. A short horror film about a family that moves into a mysterious old house. The daughter starts seeing ghosts that only she can see. 3 scenes, 5 minutes runtime."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="min-h-[120px] text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Tip: Include genre, number of scenes, runtime, and character details for better results.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAiDialogOpen(false)}
              disabled={generateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!aiPrompt.trim() || generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Generate Script
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
