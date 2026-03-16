import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGenerateTextMutation } from '@/features/ai/hooks/use-ai-query';
import { useChaptersQuery } from './use-chapters-query';
import { useScenesQuery, useCreateSceneMutation, useUpdateSceneMutation, useDeleteSceneMutation, sceneQueryKeys } from './use-scenes-query';
import { useCharactersQuery } from './use-characters-query';
import { batchCreateScenes } from '../services/scenes-api';
import { SCENE_JSON_SCHEMA } from '../constants/scenes';
import type { Scene, CreateScenePayload, DirectorPersona, TimeOfDay, SceneMood } from '../types';

interface UseScenesOptions {
  project_id: string;
  director_persona: DirectorPersona | null;
}

const EMPTY_FORM: CreateScenePayload = {
  title: '',
  description: '',
  action: '',
  dialogue: '',
  location: '',
  time_of_day: 'day',
  mood: 'dramatic',
  characters: [],
  camera_notes: '',
  order: 0,
};

export function useScenes({ project_id, director_persona }: UseScenesOptions) {
  const queryClient = useQueryClient();

  /* ── Queries ── */
  const { data: scenes = [], isLoading } = useScenesQuery(project_id);
  const { data: chapters = [] } = useChaptersQuery(project_id);
  const { data: characters = [] } = useCharactersQuery(project_id);

  /* ── Mutations ── */
  const createMutation = useCreateSceneMutation();
  const updateMutation = useUpdateSceneMutation();
  const deleteMutation = useDeleteSceneMutation();
  const generateMutation = useGenerateTextMutation();

  /* ── Sorted list ── */
  const sortedScenes = useMemo(
    () => [...scenes].sort((a, b) => a.order - b.order),
    [scenes]
  );

  /* ── Form state ── */
  const [formOpen, setFormOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [formData, setFormData] = useState<CreateScenePayload>(EMPTY_FORM);

  /* ── Delete state ── */
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Scene | null>(null);

  /* ── Extract state ── */
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractStep, setExtractStep] = useState(0);

  /* ── Selected scene for detail view ── */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedScene = useMemo(
    () => scenes.find((s) => s.id === selectedId) ?? null,
    [scenes, selectedId]
  );

  /* ── Search ── */
  const [searchQuery, setSearchQuery] = useState('');
  const filteredScenes = useMemo(() => {
    if (!searchQuery.trim()) return sortedScenes;
    const q = searchQuery.toLowerCase();
    return sortedScenes.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [sortedScenes, searchQuery]);

  /* ── Open create form ── */
  const openCreateForm = useCallback(() => {
    setEditingScene(null);
    setFormData({ ...EMPTY_FORM, order: scenes.length });
    setFormOpen(true);
  }, [scenes.length]);

  /* ── Open edit form ── */
  const openEditForm = useCallback((scene: Scene) => {
    setEditingScene(scene);
    setFormData({
      title: scene.title,
      description: scene.description,
      action: scene.action,
      dialogue: scene.dialogue,
      location: scene.location,
      time_of_day: scene.time_of_day,
      mood: scene.mood,
      characters: scene.characters,
      camera_notes: scene.camera_notes,
      order: scene.order,
    });
    setFormOpen(true);
  }, []);

  /* ── Open delete dialog ── */
  const openDeleteDialog = useCallback((scene: Scene) => {
    setDeleteTarget(scene);
    setDeleteDialogOpen(true);
  }, []);

  /* ── Form submit ── */
  const handleFormSubmit = useCallback(async () => {
    if (!formData.title.trim()) {
      toast.error('Scene title is required');
      return;
    }
    if (editingScene) {
      // Update
      updateMutation.mutate({
        projectId: project_id,
        sceneId: editingScene.id,
        data: {
          title: formData.title,
          description: formData.description,
          action: formData.action,
          dialogue: formData.dialogue,
          location: formData.location,
          time_of_day: formData.time_of_day as TimeOfDay,
          mood: formData.mood as SceneMood,
          characters: formData.characters,
          camera_notes: formData.camera_notes,
        },
      }, {
        onSuccess: () => setFormOpen(false),
      });
    } else {
      // Create
      createMutation.mutate({
        projectId: project_id,
        payload: formData,
      }, {
        onSuccess: () => setFormOpen(false),
      });
    }
  }, [editingScene, formData, project_id, updateMutation, createMutation]);

  /* ── Delete ── */
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { projectId: project_id, sceneId: deleteTarget.id },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
          if (selectedId === deleteTarget.id) setSelectedId(null);
        },
      }
    );
  }, [deleteTarget, project_id, deleteMutation, selectedId]);

  /* ── AI Extract from Script ── */
  const handleExtractFromScript = useCallback(async () => {
    if (chapters.length === 0) {
      toast.error('No script chapters to extract scenes from');
      return;
    }

    setExtractLoading(true);
    setExtractStep(0);

    const scriptContent = chapters
      .sort((a, b) => a.order - b.order)
      .map((ch) => `## ${ch.title}\n${ch.content.replace(/<[^>]*>/g, '')}`)
      .join('\n\n');

    // Build character name list for the AI to reference
    const characterNames = characters.map((c) => c.name);

    const personaPrefix = director_persona?.system_instruction
      ? director_persona.system_instruction + '\n\n'
      : '';

    const systemPrompt = personaPrefix +
      `You are a professional screenplay scene breakdown specialist. Analyze the following screenplay and break it into individual scenes.

A scene changes whenever there's a significant change in LOCATION, TIME, or a clear dramatic beat shift.

You MUST respond with ONLY a valid JSON array — no markdown, no code fences, no extra text.

Each scene should follow this exact schema:
${SCENE_JSON_SCHEMA}

Available characters in this project: ${JSON.stringify(characterNames)}

Rules:
- Identify EVERY scene change (location/time shifts)
- "characters" array must use exact names from the provided character list
- Keep dialogue to the most impactful/important lines per scene
- action should describe what physically happens
- camera_notes should suggest cinematic shot types (wide, close-up, tracking, etc)
- time_of_day must be one of: day, night, dawn, dusk, evening
- mood must be one of: tense, romantic, comedic, dramatic, peaceful, mysterious, action, melancholic, triumphant, horror
- Order scenes chronologically as they appear in the script
- Be specific with locations (not just "inside" but "dimly lit apartment kitchen")`;

    try {
      setExtractStep(1);
      await new Promise((r) => setTimeout(r, 500));
      setExtractStep(2);
      const result = await generateMutation.mutateAsync({
        prompt: scriptContent,
        system_instruction: systemPrompt,
      });
      let raw = result.data.text.trim();
      if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('AI returned empty result');
      setExtractStep(3);
      await new Promise((r) => setTimeout(r, 400));
      await batchCreateScenes(project_id, parsed);
      queryClient.invalidateQueries({ queryKey: sceneQueryKeys.list(project_id) });
      toast.success(`Extracted ${parsed.length} scenes from script`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to extract scenes');
    } finally {
      setExtractLoading(false);
      setExtractStep(0);
    }
  }, [chapters, characters, director_persona, project_id, generateMutation, queryClient]);

  const isFormPending = createMutation.isPending || updateMutation.isPending;
  const isDeletePending = deleteMutation.isPending;

  return {
    // Data
    scenes,
    sortedScenes,
    filteredScenes,
    characters,
    chapters,
    isLoading,
    selectedScene,
    selectedId,
    setSelectedId,
    searchQuery,
    setSearchQuery,

    // Form
    formOpen,
    setFormOpen,
    editingScene,
    formData,
    setFormData,
    openCreateForm,
    openEditForm,
    handleFormSubmit,
    isFormPending,

    // Delete
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteTarget,
    openDeleteDialog,
    handleDelete,
    isDeletePending,

    // Extract
    extractLoading,
    extractStep,
    handleExtractFromScript,
  };
}
