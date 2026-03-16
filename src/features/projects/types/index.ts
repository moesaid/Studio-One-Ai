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

export type CharacterGender = 'male' | 'female';
export type CharacterSpecies = 'human' | 'animal';

export interface Character {
  id: string;
  project_id: string;
  name: string;
  gender: CharacterGender;
  age: number;
  species: CharacterSpecies;
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
  reference_images: string[];
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCharacterPayload {
  name: string;
  gender?: CharacterGender;
  age?: number;
  species?: CharacterSpecies;
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
  reference_images?: string[];
  order?: number;
}

export interface UpdateCharacterPayload {
  name?: string;
  gender?: CharacterGender;
  age?: number;
  species?: CharacterSpecies;
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
  reference_images?: string[];
  order?: number;
}

/* ── Characters Step ── */

export interface CharactersStepProps {
  project_id: string;
  director_persona: DirectorPersona | null;
  film_style: FilmStyle | null;
}

export interface CharacterNodeData {
  character: Character;
  onEdit: (ch: Character) => void;
  onRegenerate: (ch: Character) => void;
  onDelete: (ch: Character) => void;
  onOpenVisuals: (ch: Character) => void;
  regeneratingId: string | null;
  [key: string]: unknown;
}

/* ── Script Step ── */

export interface ScriptStepProps {
  project_id: string;
  director_persona: DirectorPersona | null;
}

/* ── Scenes ── */

export type TimeOfDay = 'day' | 'night' | 'dawn' | 'dusk' | 'evening';
export type SceneMood = 'tense' | 'romantic' | 'comedic' | 'dramatic' | 'peaceful' | 'mysterious' | 'action' | 'melancholic' | 'triumphant' | 'horror';

export interface Scene {
  id: string;
  project_id: string;
  chapter_id: string | null;
  title: string;
  description: string;
  visual_description: string;
  action: string;
  dialogue: string;
  location: string;
  time_of_day: TimeOfDay;
  mood: SceneMood;
  characters: string[];
  camera_notes: string;
  image_prompts: string[];
  reference_images: string[];
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateScenePayload {
  chapter_id?: string | null;
  title: string;
  description?: string;
  visual_description?: string;
  action?: string;
  dialogue?: string;
  location?: string;
  time_of_day?: TimeOfDay;
  mood?: SceneMood;
  characters?: string[];
  camera_notes?: string;
  image_prompts?: string[];
  reference_images?: string[];
  order?: number;
}

export interface UpdateScenePayload {
  title?: string;
  description?: string;
  visual_description?: string;
  action?: string;
  dialogue?: string;
  location?: string;
  time_of_day?: TimeOfDay;
  mood?: SceneMood;
  characters?: string[];
  camera_notes?: string;
  image_prompts?: string[];
  reference_images?: string[];
  order?: number;
}

export interface ScenesStepProps {
  project_id: string;
  project_title: string;
  project_description: string;
  director_persona: DirectorPersona | null;
  film_style: FilmStyle | null;
}

/* ── Video Clips ── */

export type VideoClipStatus = 'pending' | 'generating' | 'done' | 'failed';

export interface VideoClip {
  id: string;
  project_id: string;
  scene_id: string;
  keyframe_index: number;
  video_url: string | null;
  audio_url: string | null;
  duration: number;
  status: VideoClipStatus;
  operation_name: string | null;
  video_model: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVideoClipPayload {
  scene_id: string;
  keyframe_index: number;
  duration: number;
  video_model: string;
  operation_name: string;
}

export interface GenerateStepProps {
  project_id: string;
  project_title: string;
  project_description: string;
  director_persona: DirectorPersona | null;
  film_style: FilmStyle | null;
}

/* ── Edit Step (Video Editor) ── */

export interface EditStepProps {
  project_id: string;
}

/* ── Timeline ── */

export interface TimelineItem {
  id: string;
  clip_id: string;
  scene_id: string;
  scene_title: string;
  keyframe_index: number;
  video_url: string;
  thumbnail_url: string | null;
  duration: number;
  trim_start: number;
  trim_end: number;
  order: number;
}

