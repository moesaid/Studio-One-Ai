export type ProjectStatus = 'draft' | 'in_production' | 'completed';

export interface DirectorPersona {
  id: string;
  name: string;
  style: string;
  description: string;
  system_instruction: string;
  is_custom: boolean;
}

export interface FilmStyle {
  id: string;
  name: string;
  category: string;
  description: string;
  image_prompt: string;
  video_prompt: string;
  preview_keywords: string;
  preview_image?: string;
  is_custom: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  script: string;
  director_persona: DirectorPersona | null;
  film_style: FilmStyle | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface CreateProjectPayload {
  title: string;
  description: string;
}

export interface UpdateProjectPayload {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
}

export interface ScriptChapter {
  id: string;
  project_id: string;
  parent_id: string | null;
  title: string;
  content: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateChapterPayload {
  title: string;
  content?: string;
  parent_id?: string | null;
  order?: number;
}

export interface UpdateChapterPayload {
  id: string;
  title?: string;
  content?: string;
  order?: number;
}

/* ── Characters ── */

export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting' | 'mentor' | 'comic_relief' | 'love_interest' | 'other';

export interface CharacterRelationship {
  target_name: string;
  label: string;
}

export interface Character {
  id: string;
  project_id: string;
  name: string;
  role: CharacterRole;
  description: string;
  traits: string[];
  motivations: string[];
  flaws: string[];
  appearance: string;
  backstory: string;
  vibe: string;
  arc: string;
  voice: string;
  relationships: CharacterRelationship[];
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCharacterPayload {
  name: string;
  role?: CharacterRole;
  description?: string;
  traits?: string[];
  motivations?: string[];
  flaws?: string[];
  appearance?: string;
  backstory?: string;
  vibe?: string;
  arc?: string;
  voice?: string;
  relationships?: CharacterRelationship[];
  order?: number;
}

export interface UpdateCharacterPayload {
  name?: string;
  role?: CharacterRole;
  description?: string;
  traits?: string[];
  motivations?: string[];
  flaws?: string[];
  appearance?: string;
  backstory?: string;
  vibe?: string;
  arc?: string;
  voice?: string;
  relationships?: CharacterRelationship[];
  order?: number;
}

/* ── Characters Step ── */

export interface CharactersStepProps {
  project_id: string;
  director_persona: DirectorPersona | null;
}

export interface CharacterNodeData {
  character: Character;
  onEdit: (ch: Character) => void;
  onRegenerate: (ch: Character) => void;
  onDelete: (ch: Character) => void;
  regeneratingId: string | null;
  [key: string]: unknown;
}

/* ── Script Step ── */

export interface ScriptStepProps {
  project_id: string;
  director_persona: DirectorPersona | null;
}

