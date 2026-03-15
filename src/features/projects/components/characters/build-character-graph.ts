import type { Node, Edge, NodeTypes } from '@xyflow/react';
import type { Character } from '@/features/projects/types';
import { ROLE_CONFIG } from '@/features/projects/constants/characters';
import { CharacterNode } from './character-node';

/* ─── Node Types ─────────────────────────────────────────────── */

export const nodeTypes: NodeTypes = { character: CharacterNode };

/* ─── Build Graph ────────────────────────────────────────────── */

export function buildGraph(
  characters: Character[],
  savedPositions: Map<string, { x: number; y: number }>,
  handlers: {
    onEdit: (ch: Character) => void;
    onRegenerate: (ch: Character) => void;
    onDelete: (ch: Character) => void;
    regeneratingId: string | null;
  }
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Estimate card height based on content to avoid collisions
  function estimateCardHeight(ch: Character): number {
    let h = 120; // base (name, role, accent, padding)
    if (ch.description) h += 50;
    if (ch.arc) h += 40;
    if (ch.traits.length > 0) h += 30 + Math.ceil(ch.traits.length / 3) * 28;
    if (ch.motivations.length > 0) h += 30 + Math.ceil(ch.motivations.length / 3) * 28;
    if (ch.flaws.length > 0) h += 30 + Math.ceil(ch.flaws.length / 3) * 28;
    if (ch.voice) h += 40;
    if (ch.appearance) h += 45;
    if (ch.vibe) h += 30;
    if (ch.backstory) h += 50;
    if (ch.relationships?.length) h += 30 + ch.relationships.length * 24;
    return Math.max(h + 30, 200); // minimum height to guard against minimal characters
  }

  const cols = 4;
  const gapX = 520;
  const gapBetweenY = 140;

  // Track column heights for collision-free stacking
  const colHeights = new Array(cols).fill(80);

  characters.forEach((ch, idx) => {
    const col = idx % cols;
    const nodeId = `char-${ch.id}`;
    const y = colHeights[col];
    const cardH = estimateCardHeight(ch);
    colHeights[col] = y + cardH + gapBetweenY;

    nodes.push({
      id: nodeId,
      type: 'character',
      position: savedPositions.get(nodeId) ?? { x: col * gapX + 80, y },
      data: {
        character: ch,
        onEdit: handlers.onEdit,
        onRegenerate: handlers.onRegenerate,
        onDelete: handlers.onDelete,
        regeneratingId: handlers.regeneratingId,
      },
    });
  });

  // Build position lookup for smart handle routing
  const nodePositions = new Map<string, { x: number; y: number }>();
  nodes.forEach((n) => nodePositions.set(n.id, n.position));

  const CARD_W = 300;
  const CARD_H_EST = 300; // estimated mid-point

  function getHandles(srcId: string, tgtId: string): { sourceHandle: string; targetHandle: string } {
    const sp = nodePositions.get(srcId);
    const tp = nodePositions.get(tgtId);
    if (!sp || !tp) return { sourceHandle: 'right', targetHandle: 'left' };

    const srcCx = sp.x + CARD_W / 2;
    const srcCy = sp.y + CARD_H_EST / 2;
    const tgtCx = tp.x + CARD_W / 2;
    const tgtCy = tp.y + CARD_H_EST / 2;
    const dx = tgtCx - srcCx;
    const dy = tgtCy - srcCy;

    // Route based on dominant axis
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0
        ? { sourceHandle: 'right', targetHandle: 'left' }
        : { sourceHandle: 'left', targetHandle: 'right' };
    } else {
      return dy > 0
        ? { sourceHandle: 'bottom', targetHandle: 'top' }
        : { sourceHandle: 'top', targetHandle: 'bottom' };
    }
  }

  // Deduplicate bidirectional edges (A→B + B→A = one edge with combined label)
  const edgeSet = new Set<string>();
  const nameToId = new Map(characters.map((c) => [c.name.toLowerCase(), `char-${c.id}`]));

  characters.forEach((ch) => {
    const sourceId = `char-${ch.id}`;
    (ch.relationships ?? []).forEach((rel) => {
      const targetId = nameToId.get(rel.target_name.toLowerCase());
      if (!targetId || targetId === sourceId) return;

      // Create a canonical key so A↔B is deduplicated
      const pairKey = [sourceId, targetId].sort().join('|');
      if (edgeSet.has(pairKey)) return;
      edgeSet.add(pairKey);

      const handles = getHandles(sourceId, targetId);

      edges.push({
        id: `rel-${pairKey}`,
        source: sourceId,
        target: targetId,
        sourceHandle: handles.sourceHandle,
        targetHandle: handles.targetHandle,
        label: rel.label,
        type: 'smoothstep',
        animated: false,
        style: { stroke: ROLE_CONFIG[ch.role]?.minimap ?? '#666', strokeWidth: 1, opacity: 0.3 },
        labelStyle: { fontSize: 9, fontWeight: 500, fill: 'rgba(255,255,255,0.45)' },
        labelBgStyle: { fill: 'rgba(0,0,0,0.5)', fillOpacity: 0.8 },
        labelBgPadding: [5, 2] as [number, number],
        labelBgBorderRadius: 4,
      });
    });
  });

  return { nodes, edges };
}
