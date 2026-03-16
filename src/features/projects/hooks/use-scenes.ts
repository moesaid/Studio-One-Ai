import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGenerateTextMutation } from '@/features/ai/hooks/use-ai-query';
import { generateSceneImages, generateProjectPoster } from '@/features/ai/services/ai-api';
import { useChaptersQuery } from './use-chapters-query';
import { useScenesQuery, useCreateSceneMutation, useUpdateSceneMutation, useDeleteSceneMutation, sceneQueryKeys } from './use-scenes-query';
import { useCharactersQuery } from './use-characters-query';
import { batchCreateScenes, uploadSceneImages, uploadProjectPoster, replaceSceneImage } from '../services/scenes-api';
import { SCENE_JSON_SCHEMA } from '../constants/scenes';
import type { Scene, CreateScenePayload, DirectorPersona, FilmStyle, TimeOfDay, SceneMood } from '../types';
import type { ExtractConfig } from '../components/scenes/scene-extract-config-dialog';

interface UseScenesOptions {
  project_id: string;
  project_title: string;
  project_description: string;
  director_persona: DirectorPersona | null;
  film_style: FilmStyle | null;
}

const EMPTY_FORM: CreateScenePayload = {
  title: '',
  description: '',
  visual_description: '',
  action: '',
  dialogue: '',
  location: '',
  time_of_day: 'day',
  mood: 'dramatic',
  characters: [],
  camera_notes: '',
  image_prompts: [],
  order: 0,
};

export function useScenes({ project_id, project_title, project_description, director_persona, film_style }: UseScenesOptions) {
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

  /* ── Regeneration state ── */
  const [isRegenerating, setIsRegenerating] = useState(false);

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
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractStep, setExtractStep] = useState(0);
  const [extractProgress, setExtractProgress] = useState('');

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
      visual_description: scene.visual_description,
      action: scene.action,
      dialogue: scene.dialogue,
      location: scene.location,
      time_of_day: scene.time_of_day,
      mood: scene.mood,
      characters: scene.characters,
      camera_notes: scene.camera_notes,
      image_prompts: scene.image_prompts,
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
          visual_description: formData.visual_description,
          action: formData.action,
          dialogue: formData.dialogue,
          location: formData.location,
          time_of_day: formData.time_of_day as TimeOfDay,
          mood: formData.mood as SceneMood,
          characters: formData.characters,
          camera_notes: formData.camera_notes,
          image_prompts: formData.image_prompts,
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

  /* ── Open config dialog (instead of running extraction directly) ── */
  const handleExtractFromScript = useCallback(() => {
    if (chapters.length === 0) {
      toast.error('No script chapters to extract scenes from');
      return;
    }
    setConfigDialogOpen(true);
  }, [chapters]);

  /* ── AI Extract from Script (called from config dialog) ── */
  const handleStartExtraction = useCallback(async (config: ExtractConfig) => {
    setConfigDialogOpen(false);
    setExtractLoading(true);
    setExtractStep(0);
    setExtractProgress('');

    const scriptContent = chapters
      .sort((a, b) => a.order - b.order)
      .map((ch) => `## ${ch.title}\n${ch.content.replace(/<[^>]*>/g, '')}`)
      .join('\n\n');

    // Build character context for the AI
    const characterContext = characters.map((c) => ({
      name: c.name,
      appearance: c.appearance,
      gender: c.gender,
      age: c.age,
      role: c.role,
      vibe: c.vibe,
    }));

    const filmStyleNote = film_style
      ? `\n\nFilm Style: "${film_style.name}" — ${film_style.description}. Image prompt style: ${film_style.image_prompt}.`
      : '';

    const personaPrefix = director_persona?.system_instruction
      ? director_persona.system_instruction + '\n\n'
      : '';

    // Scene count hint
    const sceneCountHint = config.scene_count > 0
      ? `\n\nIMPORTANT: Aim for approximately ${config.scene_count} scenes. Split or merge as needed to hit this target while keeping scenes meaningful.`
      : '';

    // Images per scene hint
    const imagePromptCount = config.images_per_scene > 0 ? config.images_per_scene : 2;
    const imagePromptInstructions = imagePromptCount === 1
      ? '- The "image_prompts" array must contain EXACTLY 1 item: a cinematic establishing shot.'
      : `- The "image_prompts" array must contain EXACTLY ${imagePromptCount} items: opening establishing shot${imagePromptCount >= 2 ? ', closing dramatic shot' : ''}${imagePromptCount >= 3 ? ', and additional key moments' : ''}${imagePromptCount >= 4 ? ' capturing the full visual arc' : ''}. All should describe the same characters and environment for visual consistency.`;

    // User custom instruction
    const userInstruction = config.instruction.trim()
      ? `\n\nADDITIONAL USER INSTRUCTIONS:\n${config.instruction.trim()}`
      : '';

    const systemPrompt = personaPrefix +
      `You are a professional screenplay scene breakdown specialist AND a visual director.

Analyze the following screenplay and break it into individual scenes. Each scene must be richly described for both story AND visual generation purposes.

A scene changes whenever there's a significant change in LOCATION, TIME, or a clear dramatic beat shift.
${sceneCountHint}

You MUST respond with ONLY a valid JSON array — no markdown, no code fences, no extra text.

Each scene should follow this exact schema:
${SCENE_JSON_SCHEMA}

Available characters in this project (use these EXACT names):
${JSON.stringify(characterContext, null, 2)}
${filmStyleNote}

CRITICAL RULES:
- The "visual_description" must be a cinematographer-level paragraph describing EXACTLY what you see on screen: blocking, lighting, set design, color palette, atmosphere. It must be detailed enough to generate a photorealistic image.
${imagePromptInstructions}
- Each image prompt must reference the characters by their appearance descriptions (not just name) so the AI image generator knows what they look like.
- "characters" array must use exact names from the provided character list.
- "action" should describe what physically happens in vivid, specific detail.
- Keep the most impactful 2-3 lines of dialogue with character names.
- camera_notes should suggest cinematic shot types and transitions.
- time_of_day must be one of: day, night, dawn, dusk, evening
- mood must be one of: tense, romantic, comedic, dramatic, peaceful, mysterious, action, melancholic, triumphant, horror
- Order scenes chronologically as they appear in the script
- Be extremely specific with locations (include lighting, textures, colors)${userInstruction}`;

    try {
      // Step 1: Read screenplay
      setExtractStep(1);
      await new Promise((r) => setTimeout(r, 500));

      // Step 2: AI scene extraction
      setExtractStep(2);
      const result = await generateMutation.mutateAsync({
        prompt: scriptContent,
        system_instruction: systemPrompt,
      });
      let raw = result.data.text.trim();
      if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('AI returned empty result');

      // Step 3: Map characters
      setExtractStep(3);
      await new Promise((r) => setTimeout(r, 400));

      // Step 4: Save scenes to Firestore (now returns IDs)
      setExtractStep(4);
      const sceneIds = await batchCreateScenes(project_id, parsed);
      queryClient.invalidateQueries({ queryKey: sceneQueryKeys.list(project_id) });
      toast.success(`Extracted ${parsed.length} scenes from script`);

      // Step 5: Generate images for each scene (skip if images_per_scene === 0)
      if (config.images_per_scene > 0) {
        setExtractStep(5);
        const filmStylePrompt = film_style?.image_prompt || '';
        const directorInstruction = director_persona?.system_instruction || '';

        // ── Generate project poster with ALL characters as the style anchor ──
        let styleAnchor: string | undefined;
        setExtractProgress('Generating project poster with all characters...');

        const allCharactersForPoster = characters.map((ch) => ({
          name: ch.name,
          appearance: ch.appearance,
          gender: ch.gender,
          age: ch.age,
          reference_image_urls: ch.reference_images?.length ? ch.reference_images : undefined,
        }));

        try {
          const posterResult = await generateProjectPoster({
            project_title: project_title,
            project_description: project_description,
            characters: allCharactersForPoster,
            film_style_prompt: filmStylePrompt,
            film_style_name: film_style?.name,
            film_style_category: film_style?.category,
            film_style_description: film_style?.description,
            director_instruction: directorInstruction,
            director_name: director_persona?.name,
            director_style: director_persona?.style,
            director_description: director_persona?.description,
            image_model: config.image_model,
          });

          if (posterResult.data.image_bytes) {
            styleAnchor = posterResult.data.image_bytes;
            // Upload poster as project thumbnail
            try {
              await uploadProjectPoster(project_id, posterResult.data.image_bytes, posterResult.data.mime_type);
              toast.success('Project poster generated & set as thumbnail');
            } catch (uploadErr) {
              console.error('[poster-upload] Failed to upload poster:', uploadErr);
            }
          }
        } catch (posterErr) {
          console.error('[project-poster] Failed to generate poster:', posterErr);
          // Continue without poster — scenes will still use character references
        }

        // Delay after poster
        await new Promise((r) => setTimeout(r, 2000));

        let imagesGenerated = 0;

        for (let i = 0; i < parsed.length; i++) {
          const scene = parsed[i];
          const sceneId = sceneIds[i];
          if (!sceneId || !scene.image_prompts?.length) continue;

          // Filter out empty/whitespace-only prompts and limit to config
          const validPrompts = (scene.image_prompts as string[])
            .map((p: string) => p?.trim())
            .filter(Boolean)
            .slice(0, config.images_per_scene);
          if (validPrompts.length === 0) continue;

          setExtractProgress(`Scene ${i + 1}/${parsed.length}: "${scene.title}"`);

          // Build character data with appearances AND reference images for this scene
          const sceneCharacters = (scene.characters || [])
            .map((name: string) => {
              const ch = characters.find((c) => c.name.toLowerCase() === name.toLowerCase());
              if (!ch) return null;
              return {
                name: ch.name,
                appearance: ch.appearance,
                gender: ch.gender,
                age: ch.age,
                reference_image_urls: ch.reference_images?.length ? ch.reference_images : undefined,
              };
            })
            .filter(Boolean) as { name: string; appearance: string; gender?: string; age?: number; reference_image_urls?: string[] }[];

          try {
            const imgResult = await generateSceneImages({
              scene_title: scene.title,
              visual_description: scene.visual_description || scene.description || '',
              location: scene.location || '',
              time_of_day: scene.time_of_day || 'day',
              mood: scene.mood || 'dramatic',
              image_prompts: validPrompts,
              characters: sceneCharacters,
              film_style_prompt: filmStylePrompt,
              film_style_name: film_style?.name,
              film_style_category: film_style?.category,
              film_style_description: film_style?.description,
              director_instruction: directorInstruction,
              director_name: director_persona?.name,
              director_style: director_persona?.style,
              director_description: director_persona?.description,
              image_model: config.image_model,
              // Pass style anchor from project poster for cross-scene consistency
              style_anchor: styleAnchor,
            });

            // Step 6: Upload to storage
            if (imgResult.data.images.length > 0) {
              setExtractStep(6);
              await uploadSceneImages(project_id, sceneId, imgResult.data.images);
              imagesGenerated += imgResult.data.images.length;
            }
          } catch (imgErr) {
            console.error(`[scene-images] Failed for scene "${scene.title}":`, imgErr);
            // Continue with other scenes — don't block the entire extraction
          }

          // Delay between scenes to respect rate limits
          if (i < parsed.length - 1) {
            await new Promise((r) => setTimeout(r, 2000));
          }
        }

        queryClient.invalidateQueries({ queryKey: sceneQueryKeys.list(project_id) });
        if (imagesGenerated > 0) {
          toast.success(`Generated ${imagesGenerated} images across ${parsed.length} scenes`);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to extract scenes');
    } finally {
      setExtractLoading(false);
      setExtractStep(0);
      setExtractProgress('');
    }
  }, [chapters, characters, director_persona, film_style, project_id, generateMutation, queryClient]);

  /* ── Single frame regeneration ── */
  const handleRegenerateImage = useCallback(async (sceneId: string, imageIndex: number, note: string) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) return;

    setIsRegenerating(true);
    try {
      const filmStylePrompt = film_style?.image_prompt || '';
      const directorInstruction = director_persona?.system_instruction || '';

      // Build the prompt for this specific frame
      const basePrompt = scene.image_prompts?.[imageIndex] || scene.visual_description || scene.description || '';
      const finalPrompt = note ? `${basePrompt}. Additional direction: ${note}` : basePrompt;

      // Build character data for this scene
      const sceneCharacters = (scene.characters || [])
        .map((name: string) => {
          const ch = characters.find((c) => c.name.toLowerCase() === name.toLowerCase());
          if (!ch) return null;
          return {
            name: ch.name,
            appearance: ch.appearance,
            gender: ch.gender,
            age: ch.age,
            reference_image_urls: ch.reference_images?.length ? ch.reference_images : undefined,
          };
        })
        .filter(Boolean) as { name: string; appearance: string; gender?: string; age?: number; reference_image_urls?: string[] }[];

      const imgResult = await generateSceneImages({
        scene_title: scene.title,
        visual_description: scene.visual_description || scene.description || '',
        location: scene.location || '',
        time_of_day: scene.time_of_day || 'day',
        mood: scene.mood || 'dramatic',
        image_prompts: [finalPrompt],
        characters: sceneCharacters,
        film_style_prompt: filmStylePrompt,
        film_style_name: film_style?.name,
        film_style_category: film_style?.category,
        film_style_description: film_style?.description,
        director_instruction: directorInstruction,
        director_name: director_persona?.name,
        director_style: director_persona?.style,
        director_description: director_persona?.description,
      });

      if (imgResult.data.images.length > 0) {
        const newImage = imgResult.data.images[0];
        await replaceSceneImage(project_id, sceneId, imageIndex, newImage.image_bytes, newImage.mime_type);
        queryClient.invalidateQueries({ queryKey: sceneQueryKeys.list(project_id) });
        toast.success(`Regenerated ${imageIndex === 0 ? 'opening' : `frame ${imageIndex + 1}`} successfully`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to regenerate image');
    } finally {
      setIsRegenerating(false);
    }
  }, [scenes, characters, director_persona, film_style, project_id, queryClient]);

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
    configDialogOpen,
    setConfigDialogOpen,
    extractLoading,
    extractStep,
    extractProgress,
    handleExtractFromScript,
    handleStartExtraction,

    // Regeneration
    handleRegenerateImage,
    isRegenerating,
  };
}
