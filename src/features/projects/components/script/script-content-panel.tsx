'use client';

import { Loader2, Sparkles, Pencil, Save, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScriptEditor } from '@/features/projects/components/script-editor';
import type { ScriptChapter } from '@/features/projects/types';

interface ScriptContentPanelProps {
  chapter: ScriptChapter;
  editingId: string | null;
  editContent: string;
  onEditContentChange: (html: string) => void;
  onStartEditing: (chapter: ScriptChapter) => void;
  onCancelEditing: () => void;
  onSave: () => void;
  onAiGenerate: (chapter: ScriptChapter) => void;
  isUpdatePending: boolean;
  wordCount: number;
  charCount: number;
}

export function ScriptContentPanel({
  chapter,
  editingId,
  editContent,
  onEditContentChange,
  onStartEditing,
  onCancelEditing,
  onSave,
  onAiGenerate,
  isUpdatePending,
  wordCount,
  charCount,
}: ScriptContentPanelProps) {
  const isEditing = editingId === chapter.id;
  const hasContent = chapter.content.replace(/<[^>]*>/g, '').trim().length > 0;

  return (
    <>
      {/* Chapter header */}
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{chapter.title}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onCancelEditing} disabled={isUpdatePending}>
                <X className="mr-1.5 h-3 w-3" />
                Cancel
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={onSave} disabled={isUpdatePending}>
                {isUpdatePending ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <Save className="mr-1.5 h-3 w-3" />}
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onAiGenerate(chapter)}>
                <Sparkles className="mr-1.5 h-3 w-3" />
                AI Generate
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onStartEditing(chapter)}>
                <Pencil className="mr-1.5 h-3 w-3" />
                Edit
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isEditing ? (
          <ScriptEditor
            key={`edit-${chapter.id}`}
            content={editContent}
            onChange={onEditContentChange}
            editable={true}
            placeholder="Start writing your screenplay..."
          />
        ) : hasContent ? (
          <ScriptEditor
            key={`view-${chapter.id}`}
            content={chapter.content}
            editable={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center max-w-xs">
              <FileText className="h-8 w-8 text-muted-foreground/30" strokeWidth={1.5} />
              <p className="text-xs text-muted-foreground">
                This chapter is empty. Start writing or generate content with AI.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => onStartEditing(chapter)}>
                  <Pencil className="mr-1.5 h-3 w-3" />
                  Write
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => onAiGenerate(chapter)}>
                  <Sparkles className="mr-1.5 h-3 w-3" />
                  Generate with AI
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-border/50 px-6 py-1.5">
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span>{wordCount.toLocaleString()} words</span>
          <Separator orientation="vertical" className="h-3" />
          <span>{charCount.toLocaleString()} characters</span>
        </div>
        {isEditing && <span className="text-[11px] text-amber-500">Editing</span>}
      </div>
    </>
  );
}
