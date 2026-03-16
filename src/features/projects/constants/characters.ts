import type { CharacterRole } from '../types';

/* ─── Role Config ────────────────────────────────────────────── */

export const ROLE_CONFIG: Record<CharacterRole, { label: string; accent: string; ring: string; text: string; minimap: string; pillBg: string }> = {
  protagonist: { label: 'Protagonist', accent: 'from-amber-500 to-amber-600', ring: 'ring-amber-500/30', text: 'text-amber-400', minimap: '#f59e0b', pillBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  antagonist: { label: 'Antagonist', accent: 'from-red-500 to-red-600', ring: 'ring-red-500/30', text: 'text-red-400', minimap: '#ef4444', pillBg: 'bg-red-500/10 text-red-300 border-red-500/20' },
  supporting: { label: 'Supporting', accent: 'from-blue-500 to-blue-600', ring: 'ring-blue-500/30', text: 'text-blue-400', minimap: '#3b82f6', pillBg: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
  mentor: { label: 'Mentor', accent: 'from-emerald-500 to-emerald-600', ring: 'ring-emerald-500/30', text: 'text-emerald-400', minimap: '#10b981', pillBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
  comic_relief: { label: 'Comic Relief', accent: 'from-pink-500 to-pink-600', ring: 'ring-pink-500/30', text: 'text-pink-400', minimap: '#ec4899', pillBg: 'bg-pink-500/10 text-pink-300 border-pink-500/20' },
  love_interest: { label: 'Love Interest', accent: 'from-rose-500 to-rose-600', ring: 'ring-rose-500/30', text: 'text-rose-400', minimap: '#f43f5e', pillBg: 'bg-rose-500/10 text-rose-300 border-rose-500/20' },
  other: { label: 'Other', accent: 'from-zinc-500 to-zinc-600', ring: 'ring-zinc-500/30', text: 'text-zinc-400', minimap: '#71717a', pillBg: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20' },
};

export const ROLES: CharacterRole[] = ['protagonist', 'antagonist', 'supporting', 'mentor', 'comic_relief', 'love_interest', 'other'];

/* ─── AI Prompts ─────────────────────────────────────────────── */

export const CHARACTER_JSON_SCHEMA = `{
  "name": "CHARACTER NAME",
  "gender": "male|female",
  "age": 30,
  "species": "human|animal",
  "role": "protagonist|antagonist|supporting|mentor|comic_relief|love_interest|other",
  "description": "2-3 sentence personality and motivation summary",
  "traits": ["defining personality trait 1", "trait 2", "trait 3"],
  "motivations": ["what drives them 1", "what drives them 2"],
  "flaws": ["internal weakness 1", "flaw 2"],
  "appearance": "Physical description based on script clues",
  "backstory": "Inferred backstory from the screenplay context",
  "vibe": "One-liner capturing this character's energy/essence",
  "arc": "Their transformation arc (e.g., 'goes from coward to leader')",
  "voice": "Speech style and tone notes (e.g., 'formal, uses metaphors')",
  "relationships": [{"target_name": "Other Character Name", "label": "relationship type"}]
}`;

/* ─── Extract Steps ──────────────────────────────────────────── */

export const EXTRACT_STEPS = [
  { label: 'Analyzing screenplay structure...', icon: '📖' },
  { label: 'Extracting characters via AI...', icon: '🤖' },
  { label: 'Building character profiles & relationships...', icon: '🔗' },
  { label: 'Saving characters to project...', icon: '💾' },
];

/* ─── Keyboard Shortcuts ─────────────────────────────────────── */

export const KEYBOARD_SHORTCUTS: [string, string][] = [
  ['Delete / ⌫', 'Delete selected'],
  ['⌘ A', 'Select all'],
  ['Escape', 'Deselect all'],
  ['N', 'New character'],
  ['?', 'Toggle shortcuts'],
  ['Double-click', 'Edit character'],
  ['Drag', 'Move character'],
  ['Scroll', 'Zoom in/out'],
];

