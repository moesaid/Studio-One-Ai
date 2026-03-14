export type ProjectStatus = 'draft' | 'in_production' | 'completed';

export interface DirectorPersona {
  id: string;
  name: string;
  style: string;
  description: string;
  system_instruction: string;
  is_custom: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  script: string;
  director_persona: DirectorPersona | null;
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
