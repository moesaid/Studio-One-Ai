'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  useChaptersQuery,
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
} from '@/features/projects/hooks';
import { chapterQueryKeys } from '@/features/projects/hooks/use-chapters-query';
import { useGenerateTextMutation } from '@/features/ai/hooks/use-ai-query';
import { batchCreateChapters } from '@/features/projects/services/chapters-api';
import type { GeneratedChapter } from '@/features/projects/services/chapters-api';
import { ensureHtml } from '@/features/projects/components/script-editor';
import type { ScriptChapter, DirectorPersona } from '@/features/projects/types';

interface UseScriptEditorOptions {
  project_id: string;
  director_persona?: DirectorPersona | null;
}

export function useScriptEditor({ project_id, director_persona }: UseScriptEditorOptions) {
  const { data: chapters = [], isLoading } = useChaptersQuery(project_id);

  const queryClient = useQueryClient();
  const createMutation = useCreateChapterMutation();
  const updateMutation = useUpdateChapterMutation();
  const deleteMutation = useDeleteChapterMutation();
  const generateMutation = useGenerateTextMutation();

  /* ── Selection ── */
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /* ── Dialog state ── */
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

  const [fullGenDialogOpen, setFullGenDialogOpen] = useState(false);
  const [fullGenPrompt, setFullGenPrompt] = useState('');
  const [fullGenLoading, setFullGenLoading] = useState(false);

  /* ── Editing state ── */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  /* ── Derived data ── */
  const sortedChapters = useMemo(
    () => [...chapters].sort((a, b) => a.order - b.order),
    [chapters]
  );

  const selectedChapter = useMemo(
    () => chapters.find((c) => c.id === selectedId) ?? null,
    [chapters, selectedId]
  );

  const wordCount = selectedChapter?.content.trim()
    ? selectedChapter.content.trim().split(/\s+/).length
    : 0;
  const charCount = selectedChapter?.content.length ?? 0;

  /* ── CRUD handlers ── */
  const handleAddChapter = useCallback(() => {
    if (!addTitle.trim()) return;
    createMutation.mutate(
      {
        projectId: project_id,
        payload: { title: addTitle.trim(), parent_id: null, order: sortedChapters.length },
      },
      {
        onSuccess: (res) => {
          setAddDialogOpen(false);
          setAddTitle('');
          setSelectedId(res.data.id);
        },
      }
    );
  }, [addTitle, createMutation, project_id, sortedChapters.length]);

  const handleRename = useCallback(() => {
    if (!renameChapter || !renameTitle.trim()) return;
    updateMutation.mutate(
      { projectId: project_id, chapterId: renameChapter.id, data: { title: renameTitle.trim() } },
      { onSuccess: () => { setRenameDialogOpen(false); setRenameChapter(null); } }
    );
  }, [renameChapter, renameTitle, updateMutation, project_id]);

  const handleDelete = useCallback(() => {
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
  }, [deleteTarget, deleteMutation, project_id, selectedId]);

  /* ── Editing helpers ── */
  const startEditing = useCallback((chapter: ScriptChapter) => {
    setEditingId(chapter.id);
    setEditContent(ensureHtml(chapter.content));
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditContent('');
  }, []);

  const saveContent = useCallback(() => {
    if (!editingId) return;
    const savedContent = editContent;
    const savedId = editingId;

    // Optimistic cache update
    queryClient.setQueryData(
      chapterQueryKeys.all(project_id),
      (old: { data: ScriptChapter[] } | undefined) => {
        if (!old) return old;
        return { ...old, data: old.data.map((ch) => ch.id === savedId ? { ...ch, content: savedContent } : ch) };
      }
    );

    setEditingId(null);
    setEditContent('');

    updateMutation.mutate(
      { projectId: project_id, chapterId: savedId, data: { content: savedContent } },
      { onError: () => { queryClient.invalidateQueries({ queryKey: chapterQueryKeys.all(project_id) }); } }
    );
  }, [editingId, editContent, queryClient, project_id, updateMutation]);

  /* ── AI generation (single chapter) ── */
  const openAiDialog = useCallback((chapter: ScriptChapter) => {
    setAiTargetChapter(chapter);
    setAiDialogOpen(true);
  }, []);

  const handleAiGenerate = useCallback(() => {
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
            { onSuccess: () => { setAiDialogOpen(false); setAiPrompt(''); setAiTargetChapter(null); } }
          );
        },
      }
    );
  }, [aiPrompt, aiTargetChapter, director_persona, generateMutation, updateMutation, project_id]);

  /* ── Full-script AI generation ── */
  const handleFullScriptGenerate = useCallback(async () => {
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
- Keep chapter titles SHORT (2-4 words max, e.g. "The Arrival", "Dark Alliance", "Final Stand")
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

      let raw = result.data.text.trim();
      if (raw.startsWith('```')) {
        raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      const parsed: GeneratedChapter[] = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('AI returned an empty or invalid structure');
      }

      await batchCreateChapters(project_id, parsed);
      queryClient.invalidateQueries({ queryKey: chapterQueryKeys.all(project_id) });
      toast.success(`Generated ${parsed.length} chapters successfully!`);
      setFullGenDialogOpen(false);
      setFullGenPrompt('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate script');
    } finally {
      setFullGenLoading(false);
    }
  }, [fullGenPrompt, director_persona, generateMutation, project_id, queryClient]);

  /* ── Rename dialog opener ── */
  const openRenameDialog = useCallback((chapter: ScriptChapter) => {
    setRenameChapter(chapter);
    setRenameTitle(chapter.title);
    setRenameDialogOpen(true);
  }, []);

  /* ── Delete dialog opener ── */
  const openDeleteDialog = useCallback((chapter: ScriptChapter) => {
    setDeleteTarget(chapter);
    setDeleteDialogOpen(true);
  }, []);

  return {
    // Data
    chapters,
    sortedChapters,
    selectedChapter,
    isLoading,
    wordCount,
    charCount,

    // Selection
    selectedId,
    setSelectedId,

    // Editing
    editingId,
    editContent,
    setEditContent,
    startEditing,
    cancelEditing,
    saveContent,

    // Add dialog
    addDialogOpen,
    setAddDialogOpen,
    addTitle,
    setAddTitle,
    handleAddChapter,
    isCreatePending: createMutation.isPending,

    // Rename dialog
    renameDialogOpen,
    setRenameDialogOpen,
    renameTitle,
    setRenameTitle,
    handleRename,
    openRenameDialog,

    // Delete dialog
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteTarget,
    handleDelete,
    openDeleteDialog,
    isDeletePending: deleteMutation.isPending,

    // AI dialog
    aiDialogOpen,
    setAiDialogOpen,
    aiTargetChapter,
    aiPrompt,
    setAiPrompt,
    handleAiGenerate,
    openAiDialog,
    isGeneratePending: generateMutation.isPending,

    // Full generation dialog
    fullGenDialogOpen,
    setFullGenDialogOpen,
    fullGenPrompt,
    setFullGenPrompt,
    handleFullScriptGenerate,
    fullGenLoading,

    // Mutations state
    isUpdatePending: updateMutation.isPending,
  };
}
