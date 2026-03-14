'use client';

import {
  ScrollText,
  Plus,
  Sparkles,
  Loader2,
  FileText,
  Wand2,
  Pencil,
  Trash2,
  Save,
  X,
  MoreHorizontal,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { ScriptEditor, ensureHtml } from '@/features/projects/components/script-editor';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useChaptersQuery,
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
} from '@/features/projects/hooks';
import { useGenerateTextMutation } from '@/features/ai/hooks/use-ai-query';
import { batchCreateChapters } from '@/features/projects/services/chapters-api';
import type { GeneratedChapter } from '@/features/projects/services/chapters-api';
import { useQueryClient } from '@tanstack/react-query';
import { chapterQueryKeys } from '@/features/projects/hooks/use-chapters-query';
import { toast } from 'sonner';
import type { ScriptChapter, DirectorPersona } from '@/features/projects/types';

interface ScriptStepProps {
  project_id: string;
  director_persona: DirectorPersona | null;
}

/* ──────────────────────────────────────────────────────────────────
 * Main ScriptStep component
 * ────────────────────────────────────────────────────────────────── */
export function ScriptStep({ project_id, director_persona }: ScriptStepProps) {
  const { data: chapters = [], isLoading } = useChaptersQuery(project_id);

  const queryClient = useQueryClient();
  const createMutation = useCreateChapterMutation();
  const updateMutation = useUpdateChapterMutation();
  const deleteMutation = useDeleteChapterMutation();
  const generateMutation = useGenerateTextMutation();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addTitle, setAddTitle] = useState('');

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameChapter, setRenameChapter] = useState<ScriptChapter | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ScriptChapter | null>(null);

  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiTargetChapter, setAiTargetChapter] = useState<ScriptChapter | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');

  // Full-script generation
  const [fullGenDialogOpen, setFullGenDialogOpen] = useState(false);
  const [fullGenPrompt, setFullGenPrompt] = useState('');
  const [fullGenLoading, setFullGenLoading] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Flat sorted chapters (no sub-chapter nesting)
  const sortedChapters = useMemo(
    () => [...chapters].sort((a, b) => a.order - b.order),
    [chapters]
  );

  const selectedChapter = useMemo(
    () => chapters.find((c) => c.id === selectedId) ?? null,
    [chapters, selectedId]
  );

  // CRUD handlers
  function handleAddChapter() {
    if (!addTitle.trim()) return;
    createMutation.mutate(
      {
        projectId: project_id,
        payload: {
          title: addTitle.trim(),
          parent_id: null,
          order: sortedChapters.length,
        },
      },
      {
        onSuccess: (res) => {
          setAddDialogOpen(false);
          setAddTitle('');
          setSelectedId(res.data.id);
        },
      }
    );
  }

  function handleRename() {
    if (!renameChapter || !renameTitle.trim()) return;
    updateMutation.mutate(
      {
        projectId: project_id,
        chapterId: renameChapter.id,
        data: { title: renameTitle.trim() },
      },
      {
        onSuccess: () => {
          setRenameDialogOpen(false);
          setRenameChapter(null);
        },
      }
    );
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { projectId: project_id, chapterId: deleteTarget.id },
      {
        onSuccess: () => {
          if (selectedId === deleteTarget.id) setSelectedId(null);
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        },
      }
    );
  }

  function startEditing(chapter: ScriptChapter) {
    setEditingId(chapter.id);
    setEditContent(ensureHtml(chapter.content));
  }

  function cancelEditing() {
    setEditingId(null);
    setEditContent('');
  }

  function saveContent() {
    if (!editingId) return;
    const savedContent = editContent;
    const savedId = editingId;

    // Optimistically update the cache so the read-only view shows changes immediately
    queryClient.setQueryData(
      chapterQueryKeys.all(project_id),
      (old: { data: ScriptChapter[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((ch) =>
            ch.id === savedId ? { ...ch, content: savedContent } : ch
          ),
        };
      }
    );

    // Exit edit mode immediately
    setEditingId(null);
    setEditContent('');

    // Persist to Firestore
    updateMutation.mutate(
      {
        projectId: project_id,
        chapterId: savedId,
        data: { content: savedContent },
      },
      {
        onError: () => {
          // Revert on failure
          queryClient.invalidateQueries({
            queryKey: chapterQueryKeys.all(project_id),
          });
        },
      }
    );
  }

  // AI generation (single chapter)
  function handleAiGenerate() {
    if (!aiPrompt.trim() || !aiTargetChapter) return;

    const personaPrefix = director_persona?.system_instruction
      ? director_persona.system_instruction + '\n\n'
      : '';

    generateMutation.mutate(
      {
        prompt: aiPrompt.trim(),
        system_instruction:
          personaPrefix +
          `You are a professional screenwriter. Write screenplay content for the specified chapter/section.
Format your output as clean HTML suitable for a rich text editor:
- Use <h2> for scene headings (INT./EXT. locations)
- Use <p> for action/description paragraphs
- Use <strong> for character names before dialogue
- Use <em> for parentheticals
- Use <blockquote> for important dialogue or narration
- Keep the formatting clean and readable like a blog post
- Be creative, detailed, and cinematic`,
      },
      {
        onSuccess: (data) => {
          const generated = data.data.text;
          updateMutation.mutate(
            {
              projectId: project_id,
              chapterId: aiTargetChapter.id,
              data: {
                content: aiTargetChapter.content
                  ? ensureHtml(aiTargetChapter.content) + '<hr>' + ensureHtml(generated)
                  : ensureHtml(generated),
              },
            },
            {
              onSuccess: () => {
                setAiDialogOpen(false);
                setAiPrompt('');
                setAiTargetChapter(null);
              },
            }
          );
        },
      }
    );
  }

  function openAiDialog(chapter: ScriptChapter) {
    setAiTargetChapter(chapter);
    setAiDialogOpen(true);
  }

  // Full-script AI generation handler
  async function handleFullScriptGenerate() {
    if (!fullGenPrompt.trim()) return;
    setFullGenLoading(true);

    const personaPrefix = director_persona?.system_instruction
      ? director_persona.system_instruction + '\n\n'
      : '';

    const systemPrompt =
      personaPrefix +
      `You are a professional screenwriter. The user will give you a story concept or description. Generate a complete screenplay structure with chapters.

You MUST respond with ONLY valid JSON — no markdown, no code fences, no extra text.

Use this exact format:
[
  {
    "title": "Short Chapter Title",
    "content": "<h2>INT. LOCATION - TIME</h2><p>Action description here.</p><p><strong>CHARACTER NAME</strong></p><p>Dialogue here.</p>"
  }
]

Rules:
- Create 3-8 chapters depending on the story scope
- Keep chapter titles SHORT (2-4 words max, e.g. \"The Arrival\", \"Dark Alliance\", \"Final Stand\")
- Each chapter should have meaningful screenplay content (not just outlines)
- Do NOT use sub_chapters — only flat chapters
- Format content as clean HTML:
  * <h2> for scene headings (INT./EXT. locations)
  * <p> for action/description
  * <strong> for character names
  * <em> for parentheticals
  * <blockquote> for important narration or voiceover
- Make it read like a polished blog post / literary script
- Be creative, cinematic, and detailed`;

    try {
      const result = await generateMutation.mutateAsync({
        prompt: fullGenPrompt.trim(),
        system_instruction: systemPrompt,
      });

      // Parse the JSON response
      let raw = result.data.text.trim();
      // Strip markdown fences if present
      if (raw.startsWith('```')) {
        raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      const parsed: GeneratedChapter[] = JSON.parse(raw);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('AI returned an empty or invalid structure');
      }

      // Batch-create all chapters in Firestore
      await batchCreateChapters(project_id, parsed);

      // Invalidate cache to refresh sidebar
      queryClient.invalidateQueries({
        queryKey: chapterQueryKeys.all(project_id),
      });

      toast.success(`Generated ${parsed.length} chapters successfully!`);
      setFullGenDialogOpen(false);
      setFullGenPrompt('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate script';
      toast.error(msg);
    } finally {
      setFullGenLoading(false);
    }
  }

  // Word count for selected chapter
  const wordCount = selectedChapter?.content.trim()
    ? selectedChapter.content.trim().split(/\s+/).length
    : 0;
  const charCount = selectedChapter?.content.length ?? 0;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Step header */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <ScrollText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Script</h2>
              <p className="text-xs text-muted-foreground">
                Organize your screenplay into chapters
                {director_persona && (
                  <span className="text-violet-400/70">
                    {' '}· Directed by {director_persona.name}
                  </span>
                )}
              </p>
            </div>
          </div>
          {chapters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setFullGenDialogOpen(true)}
            >
              <Wand2 className="mr-1.5 h-3 w-3" />
              Generate Full Script
            </Button>
          )}
        </div>

        {/* Two-panel layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left — Chapter sidebar */}
          <div className="flex w-[220px] shrink-0 flex-col border-r border-border/50 bg-black/20">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Chapters
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setAddDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="py-1 pb-8">
                {sortedChapters.length > 0 ? (
                  sortedChapters.map((chapter, idx) => {
                    const isSelected = selectedId === chapter.id;
                    return (
                      <div key={chapter.id}>
                        <Tooltip>
                          <TooltipTrigger
                            render={<div />}
                            className={`
                              group relative flex items-center gap-2.5 cursor-pointer transition-all
                              py-2 pl-3 pr-2
                              ${isSelected
                                ? 'bg-white/[0.06] text-foreground'
                                : 'text-muted-foreground hover:bg-white/[0.03] hover:text-foreground/80'
                              }
                            `}
                            onClick={() => setSelectedId(chapter.id)}
                          >
                              {/* Orange accent for selected */}
                              {isSelected && (
                                <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-orange-500" />
                              )}

                              {/* Chapter number */}
                              <span
                                className={`shrink-0 flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                                  isSelected
                                    ? 'bg-orange-500/20 text-orange-400'
                                    : 'bg-white/[0.04] text-muted-foreground/50'
                                }`}
                              >
                                {idx + 1}
                              </span>

                              {/* Truncated title */}
                              <span className="flex-1 truncate text-[12px] font-medium leading-tight">
                                {chapter.title}
                              </span>

                              {/* Kebab menu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  onClick={(e) => e.stopPropagation()}
                                  className="shrink-0 h-5 w-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity"
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem onClick={() => openAiDialog(chapter)}>
                                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                                    Generate with AI
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setRenameChapter(chapter);
                                      setRenameTitle(chapter.title);
                                      setRenameDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="mr-2 h-3.5 w-3.5" />
                                    Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => {
                                      setDeleteTarget(chapter);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                          </TooltipTrigger>
                          {/* Show full title in tooltip only if it's long */}
                          {chapter.title.length > 22 && (
                            <TooltipContent side="right" className="max-w-[200px]">
                              <p className="text-xs">{chapter.title}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                        {/* Divider between chapters */}
                        <div className="mx-3 border-b border-border/10" />
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3 py-6 text-center">
                    <p className="text-[11px] text-muted-foreground">No chapters yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 h-7 text-[11px]"
                      onClick={() => setAddDialogOpen(true)}
                    >
                      <Plus className="mr-1.5 h-3 w-3" />
                      Add Chapter
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right — Content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedChapter ? (
              <>
                {/* Chapter header */}
                <div className="flex items-center justify-between border-b border-border/50 px-6 py-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {selectedChapter.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {editingId === selectedChapter.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={cancelEditing}
                          disabled={updateMutation.isPending}
                        >
                          <X className="mr-1.5 h-3 w-3" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={saveContent}
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="mr-1.5 h-3 w-3" />
                          )}
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => openAiDialog(selectedChapter)}
                        >
                          <Sparkles className="mr-1.5 h-3 w-3" />
                          AI Generate
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => startEditing(selectedChapter)}
                        >
                          <Pencil className="mr-1.5 h-3 w-3" />
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                  {editingId === selectedChapter.id ? (
                    <ScriptEditor
                      key={`edit-${selectedChapter.id}`}
                      content={editContent}
                      onChange={(html) => setEditContent(html)}
                      editable={true}
                      placeholder="Start writing your screenplay..."
                    />
                  ) : selectedChapter.content.replace(/<[^>]*>/g, '').trim() ? (
                    <ScriptEditor
                      key={`view-${selectedChapter.id}`}
                      content={selectedChapter.content}
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
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px]"
                            onClick={() => startEditing(selectedChapter)}
                          >
                            <Pencil className="mr-1.5 h-3 w-3" />
                            Write
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px]"
                            onClick={() => openAiDialog(selectedChapter)}
                          >
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
                  {editingId === selectedChapter.id && (
                    <span className="text-[11px] text-amber-500">Editing</span>
                  )}
                </div>
              </>
            ) : (
              /* No chapter selected */
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 ring-1 ring-blue-500/10">
                    <ScrollText className="h-6 w-6 text-blue-400/70" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-foreground">
                      {chapters.length > 0 ? 'Select a Chapter' : 'Start Your Script'}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {chapters.length > 0
                        ? 'Click on a chapter in the sidebar to view and edit its content.'
                        : 'Create your first chapter to begin writing your screenplay, or generate the entire script with AI.'}
                    </p>
                  </div>
                  {chapters.length === 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        Add Manually
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setFullGenDialogOpen(true)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
                      >
                        <Wand2 className="mr-2 h-3.5 w-3.5" />
                        Generate with AI
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Dialogs ─────────────────────────────────────────────── */}

        {/* Add Chapter Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Add Chapter</DialogTitle>
              <DialogDescription>Give your chapter a short, descriptive title.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-2">
                <Label htmlFor="chapter-title">Title</Label>
                <Input
                  id="chapter-title"
                  placeholder="e.g. The Arrival"
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddChapter}
                disabled={!addTitle.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-3.5 w-3.5" />
                )}
                Add Chapter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rename Dialog */}
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Rename Chapter</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-2">
                <Label htmlFor="rename-title">Title</Label>
                <Input
                  id="rename-title"
                  value={renameTitle}
                  onChange={(e) => setRenameTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRename}
                disabled={!renameTitle.trim() || updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                )}
                Rename
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                )}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* AI Generate Dialog (single chapter) */}
        <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Content
              </DialogTitle>
              <DialogDescription>
                Describe what you want for &quot;{aiTargetChapter?.title}&quot;.
                {director_persona && (
                  <span className="block mt-1 text-violet-400/70">
                    Director: {director_persona.name}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Textarea
                placeholder="e.g. Write the opening scene where the detective enters the abandoned warehouse..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="min-h-[100px] text-sm"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAiDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAiGenerate}
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
                    Generate
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Full Script Generation Dialog */}
        <Dialog open={fullGenDialogOpen} onOpenChange={(open) => { if (!fullGenLoading) setFullGenDialogOpen(open); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Generate Full Script
              </DialogTitle>
              <DialogDescription>
                Describe your story concept, plot, or screenplay idea. The AI will generate a
                complete chapter structure with screenplay content.
                {director_persona && (
                  <span className="block mt-2 text-violet-400/70 font-medium">
                    🎬 Directed by {director_persona.name} — {director_persona.style}
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
                  value={fullGenPrompt}
                  onChange={(e) => setFullGenPrompt(e.target.value)}
                  className="min-h-[160px] text-sm"
                  disabled={fullGenLoading}
                />
                <p className="text-[11px] text-muted-foreground">
                  The more detail you provide, the richer the generated screenplay will be.
                </p>
              </div>

              {fullGenLoading && (
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
              <Button
                variant="outline"
                onClick={() => setFullGenDialogOpen(false)}
                disabled={fullGenLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFullScriptGenerate}
                disabled={!fullGenPrompt.trim() || fullGenLoading}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
              >
                {fullGenLoading ? (
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
      </div>
    </TooltipProvider>
  );
}
