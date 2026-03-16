'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useNodesState, useEdgesState, useReactFlow, type Node } from '@xyflow/react';
import { useQueryClient } from '@tanstack/react-query';

import {
  useCharactersQuery,
  useCreateCharacterMutation,
  useUpdateCharacterMutation,
  characterQueryKeys,
} from '@/features/projects/hooks';
import { useChaptersQuery } from '@/features/projects/hooks';
import { useGenerateTextMutation } from '@/features/ai/hooks/use-ai-query';
import { batchCreateCharacters, deleteCharacter as deleteCharacterApi } from '@/features/projects/services/characters-api';
import { CHARACTER_JSON_SCHEMA, ROLE_CONFIG } from '@/features/projects/constants/characters';
import { buildGraph } from '@/features/projects/components/characters/build-character-graph';
import type { Character, CreateCharacterPayload, CharacterNodeData, DirectorPersona } from '@/features/projects/types';

interface UseCharactersCanvasOptions {
  project_id: string;
  director_persona?: DirectorPersona | null;
}

export function useCharactersCanvas({ project_id, director_persona }: UseCharactersCanvasOptions) {
  const { data: characters = [], isLoading } = useCharactersQuery(project_id);
  const { data: chapters = [] } = useChaptersQuery(project_id);

  const queryClient = useQueryClient();
  const reactFlowInstance = useReactFlow();
  const createMutation = useCreateCharacterMutation();
  const updateMutation = useUpdateCharacterMutation();
  const generateMutation = useGenerateTextMutation();

  /* ── Position persistence ── */
  const positionKey = `characters-positions-${project_id}`;
  const savedPositions = useRef<Map<string, { x: number; y: number }>>((() => {
    try {
      const stored = localStorage.getItem(positionKey);
      if (stored) return new Map(JSON.parse(stored));
    } catch { /* ignore */ }
    return new Map();
  })());

  const savePositionsToStorage = useCallback(() => {
    try {
      localStorage.setItem(positionKey, JSON.stringify([...savedPositions.current.entries()]));
    } catch { /* ignore */ }
  }, [positionKey]);

  const sortedCharacters = useMemo(
    () => [...characters].sort((a, b) => a.order - b.order),
    [characters]
  );

  /* ── Form state ── */
  const [formOpen, setFormOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [formData, setFormData] = useState<CreateCharacterPayload>({
    name: '', gender: 'male', age: 25, species: 'human', role: 'other', description: '', traits: [], motivations: [], flaws: [],
    appearance: '', backstory: '', vibe: '', arc: '', voice: '', relationships: [],
  });

  /* ── Delete state ── */
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargets, setDeleteTargets] = useState<Character[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  /* ── Extract state ── */
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractStep, setExtractStep] = useState(0);

  /* ── Other UI state ── */
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  /* ── Visuals dialog state ── */
  const [visualsOpen, setVisualsOpen] = useState(false);
  const [visualsCharacter, setVisualsCharacter] = useState<Character | null>(null);

  /* ── Handlers ── */
  const handleEdit = useCallback((ch: Character) => {
    setEditingCharacter(ch);
    setFormData({
      name: ch.name, role: ch.role, description: ch.description,
      traits: [...ch.traits], motivations: [...ch.motivations], flaws: [...ch.flaws],
      appearance: ch.appearance, backstory: ch.backstory, vibe: ch.vibe,
      arc: ch.arc, voice: ch.voice,
      relationships: ch.relationships ? [...ch.relationships] : [],
    });
    setFormOpen(true);
  }, []);

  const handleOpenVisuals = useCallback((ch: Character) => {
    setVisualsCharacter(ch);
    setVisualsOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback((ch: Character) => {
    setDeleteTargets([ch]);
    setDeleteDialogOpen(true);
  }, []);

  const handleBulkDeleteConfirm = useCallback((chars: Character[]) => {
    if (chars.length === 0) return;
    setDeleteTargets(chars);
    setDeleteDialogOpen(true);
  }, []);

  const handleRegenerate = useCallback(async (character: Character) => {
    if (chapters.length === 0) return;
    setRegeneratingId(character.id);

    const scriptContent = chapters
      .sort((a, b) => a.order - b.order)
      .map((ch) => `## ${ch.title}\n${ch.content.replace(/<[^>]*>/g, '')}`)
      .join('\n\n');

    const allCharNames = characters.map((c) => c.name).join(', ');
    const personaPrefix = director_persona?.system_instruction ? director_persona.system_instruction + '\n\n' : '';

    const systemPrompt = personaPrefix +
      `You are a screenplay character analyst. Regenerate the character bible entry for "${character.name}" based on the screenplay below.
Other characters in the story: ${allCharNames}

You MUST respond with ONLY valid JSON — no markdown, no code fences, no extra text.

${CHARACTER_JSON_SCHEMA}

Focus on dramatic depth: what drives them, what holds them back, how they transform, how they speak, and how they relate to others.`;

    try {
      const result = await generateMutation.mutateAsync({ prompt: scriptContent, system_instruction: systemPrompt });
      let raw = result.data.text.trim();
      if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      const parsed = JSON.parse(raw);
      updateMutation.mutate({
        projectId: project_id, characterId: character.id,
        data: {
          role: parsed.role || character.role,
          description: parsed.description || character.description,
          traits: parsed.traits || character.traits,
          motivations: parsed.motivations || character.motivations,
          flaws: parsed.flaws || character.flaws,
          appearance: parsed.appearance || character.appearance,
          backstory: parsed.backstory || character.backstory,
          vibe: parsed.vibe || character.vibe,
          arc: parsed.arc || character.arc,
          voice: parsed.voice || character.voice,
          relationships: parsed.relationships || character.relationships,
        },
      });
    } catch (err) {
      const { toast } = await import('sonner');
      toast.error(err instanceof Error ? err.message : 'Failed to regenerate');
    } finally {
      setRegeneratingId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters, characters, director_persona, project_id]);

  /* ── Stable refs for graph handlers ── */
  const handleEditRef = useRef(handleEdit);
  const handleRegenerateRef = useRef(handleRegenerate);
  const handleDeleteRef = useRef(handleDeleteConfirm);
  const handleBulkDeleteRef = useRef(handleBulkDeleteConfirm);
  const handleOpenVisualsRef = useRef(handleOpenVisuals);
  handleEditRef.current = handleEdit;
  handleRegenerateRef.current = handleRegenerate;
  handleDeleteRef.current = handleDeleteConfirm;
  handleBulkDeleteRef.current = handleBulkDeleteConfirm;
  handleOpenVisualsRef.current = handleOpenVisuals;

  /* ── Graph builder helper ── */
  const buildCurrentGraph = useCallback(() => {
    return buildGraph(sortedCharacters, savedPositions.current, {
      onEdit: (ch: Character) => handleEditRef.current(ch),
      onRegenerate: (ch: Character) => handleRegenerateRef.current(ch),
      onDelete: (ch: Character) => handleDeleteRef.current(ch),
      onOpenVisuals: (ch: Character) => handleOpenVisualsRef.current(ch),
      regeneratingId,
    });
  }, [sortedCharacters, regeneratingId]);

  /* ── Build graph ── */
  const graph = useMemo(() => buildCurrentGraph(), [buildCurrentGraph]);

  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);

  // Sync on data changes
  const prevKeyRef = useRef('');
  const currentKey = sortedCharacters.map((c) => `${c.id}:${c.updated_at}`).join('|') + `|regen:${regeneratingId}`;
  if (currentKey !== prevKeyRef.current) {
    prevKeyRef.current = currentKey;
    const g = buildCurrentGraph();
    setNodes(g.nodes);
    setEdges(g.edges);
  }

  /* ── Node interactions ── */
  const onNodeDragStop = useCallback((_: unknown, node: Node) => {
    savedPositions.current.set(node.id, { x: node.position.x, y: node.position.y });
    savePositionsToStorage();
  }, [savePositionsToStorage]);

  const onNodeDoubleClick = useCallback((_: unknown, node: Node) => {
    if (node.type === 'character') {
      handleEditRef.current((node.data as CharacterNodeData).character);
    }
  }, []);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (formOpen || deleteDialogOpen) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selected = nodes.filter((n) => n.selected);
        if (selected.length > 0) {
          const chars = selected.map((n) => (n.data as CharacterNodeData)?.character).filter(Boolean) as Character[];
          if (chars.length === 1) handleDeleteRef.current(chars[0]);
          else if (chars.length > 1) handleBulkDeleteRef.current(chars);
        }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
        return;
      }
      if (e.key === 'Escape') {
        setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
        return;
      }
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) { openCreateForm(); return; }
      if (e.key === '?' || (e.shiftKey && e.key === '/')) { setShowHelp((v) => !v); return; }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formOpen, deleteDialogOpen, nodes]);

  /* ── Form helpers ── */
  function openCreateForm() {
    setEditingCharacter(null);
    setFormData({ name: '', role: 'other', description: '', traits: [], motivations: [], flaws: [], appearance: '', backstory: '', vibe: '', arc: '', voice: '', relationships: [] });
    setFormOpen(true);
  }

  function handleFormSubmit() {
    if (!formData.name.trim()) return;
    if (editingCharacter) {
      updateMutation.mutate(
        { projectId: project_id, characterId: editingCharacter.id, data: { ...formData, name: formData.name.trim() } },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createMutation.mutate(
        { projectId: project_id, payload: { ...formData, name: formData.name.trim(), order: characters.length } },
        { onSuccess: () => setFormOpen(false) }
      );
    }
  }

  async function handleDelete() {
    if (deleteTargets.length === 0) return;
    const count = deleteTargets.length;
    setBulkDeleting(true);
    try {
      for (const target of deleteTargets) {
        await deleteCharacterApi(project_id, target.id);
        savedPositions.current.delete(`char-${target.id}`);
      }
      savePositionsToStorage();
      queryClient.invalidateQueries({ queryKey: characterQueryKeys.all(project_id) });
      setDeleteDialogOpen(false);
      setDeleteTargets([]);
      const { toast } = await import('sonner');
      toast.success(count > 1 ? `${count} characters deleted` : 'Character deleted');
    } catch (err) {
      const { toast } = await import('sonner');
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setBulkDeleting(false);
    }
  }

  /* ── AI Extract ── */
  async function handleExtractFromScript() {
    if (chapters.length === 0) return;
    setExtractLoading(true);
    setExtractStep(0);

    const scriptContent = chapters
      .sort((a, b) => a.order - b.order)
      .map((ch) => `## ${ch.title}\n${ch.content.replace(/<[^>]*>/g, '')}`)
      .join('\n\n');

    const personaPrefix = director_persona?.system_instruction ? director_persona.system_instruction + '\n\n' : '';

    const systemPrompt = personaPrefix +
      `You are a screenplay character analyst. Analyze the following screenplay and extract ALL characters into a character bible.

You MUST respond with ONLY a valid JSON array — no markdown, no code fences, no extra text.

Each character should follow this exact schema:
${CHARACTER_JSON_SCHEMA}

Rules:
- Extract EVERY named character, even minor ones
- Traits = defining personality qualities (brave, cunning, warm)
- Motivations = what drives them (revenge, love, survival, legacy)
- Flaws = internal weaknesses that create conflict (pride, trust issues, impulsiveness)
- Arc = their transformation journey in one sentence
- Voice = how they speak (tone, vocabulary, speech patterns)
- relationships.target_name MUST exactly match another character's "name" field
- Include meaningful relationships (rivalry, mentorship, family, romance, alliance)
- Keep descriptions vivid but concise`;

    try {
      setExtractStep(1);
      await new Promise((r) => setTimeout(r, 500));
      setExtractStep(2);
      const result = await generateMutation.mutateAsync({ prompt: scriptContent, system_instruction: systemPrompt });
      let raw = result.data.text.trim();
      if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('AI returned empty result');
      setExtractStep(3);
      await new Promise((r) => setTimeout(r, 400));
      setExtractStep(4);
      await batchCreateCharacters(project_id, parsed);
      savedPositions.current.clear();
      queryClient.invalidateQueries({ queryKey: characterQueryKeys.all(project_id) });
      const { toast } = await import('sonner');
      toast.success(`Extracted ${parsed.length} characters from script`);
    } catch (err) {
      const { toast } = await import('sonner');
      toast.error(err instanceof Error ? err.message : 'Failed to extract characters');
    } finally {
      setExtractLoading(false);
      setExtractStep(0);
    }
  }

  /* ── Reorganize ── */
  function handleReorganize() {
    savedPositions.current.clear();
    savePositionsToStorage();
    const g = buildCurrentGraph();
    setNodes(g.nodes);
    setEdges(g.edges);
    setTimeout(() => reactFlowInstance.fitView({ padding: 0.3, maxZoom: 1, duration: 500 }), 50);
  }

  /* ── Navigate to node ── */
  function navigateToNode(nodeId: string) {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      reactFlowInstance.setCenter(node.position.x + 150, node.position.y + 150, { zoom: 0.8, duration: 600 });
    }
  }

  /* ── Minimap color ── */
  const minimapColor = useCallback((node: Node) => {
    if (node.type === 'character') {
      return ROLE_CONFIG[(node.data as CharacterNodeData).character?.role]?.minimap ?? '#444';
    }
    return '#444';
  }, []);

  return {
    // Data
    characters,
    chapters,
    sortedCharacters,
    isLoading,

    // Graph
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onNodeDragStop,
    onNodeDoubleClick,
    minimapColor,

    // Form
    formOpen,
    setFormOpen,
    editingCharacter,
    formData,
    setFormData,
    openCreateForm,
    handleFormSubmit,
    isFormPending: createMutation.isPending || updateMutation.isPending,

    // Delete
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteTargets,
    handleDelete,
    bulkDeleting,

    // Extract
    extractLoading,
    extractStep,
    handleExtractFromScript,

    // Regenerate
    regeneratingId,

    // Help
    showHelp,
    setShowHelp,

    // Canvas actions
    handleReorganize,
    navigateToNode,

    // Visuals
    visualsOpen,
    setVisualsOpen,
    visualsCharacter,
  };
}
