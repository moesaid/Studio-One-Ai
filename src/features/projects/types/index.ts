export type ProjectStatus = 'draft' | 'in_production' | 'completed';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
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
