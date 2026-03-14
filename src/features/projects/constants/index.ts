import type { ProjectStatus, CreateProjectPayload } from '../types';

export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; bg: string }
> = {
  draft: {
    label: 'Draft',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
  },
  in_production: {
    label: 'In Production',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10 border-sky-400/20',
  },
  completed: {
    label: 'Completed',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
  },
};

export const EMPTY_PROJECT: CreateProjectPayload = {
  title: '',
  description: '',
};
