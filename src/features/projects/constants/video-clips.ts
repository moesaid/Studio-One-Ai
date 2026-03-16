/* ── Veo Video Models ── */

export const VEO_MODELS = [
  {
    id: 'veo-3.1-generate-001',
    label: 'Veo 3.1',
    description: 'Latest Veo model, highest quality, built-in audio',
    supports_audio: true,
  },
  {
    id: 'veo-3.1-fast-generate-001',
    label: 'Veo 3.1 Fast',
    description: 'Fast Veo 3.1 variant, lower latency',
    supports_audio: true,
  },
  {
    id: 'veo-3.0-generate-001',
    label: 'Veo 3.0',
    description: 'Stable Veo 3 model with built-in audio',
    supports_audio: true,
  },
  {
    id: 'veo-3.0-fast-generate-001',
    label: 'Veo 3.0 Fast',
    description: 'Fast Veo 3 variant',
    supports_audio: true,
  },
  {
    id: 'veo-2.0-generate-001',
    label: 'Veo 2.0',
    description: 'Stable Veo 2 model (no built-in audio)',
    supports_audio: false,
  },
] as const;

export type VeoModelId = (typeof VEO_MODELS)[number]['id'];

/* ── Lyria Music Model ── */

export const LYRIA_MODEL = 'lyria-002';

/* ── Video Generation Defaults ── */

export const DEFAULT_VIDEO_DURATION = 8;
export const DEFAULT_ASPECT_RATIO = '16:9';
export const DEFAULT_RESOLUTION = '720p';

export const VIDEO_DURATIONS = [
  { value: 4, label: '4s' },
  { value: 6, label: '6s' },
  { value: 8, label: '8s' },
] as const;

export const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9 Landscape' },
  { value: '9:16', label: '9:16 Portrait' },
] as const;

export const RESOLUTIONS = [
  { value: '720p', label: '720p' },
  { value: '1080p', label: '1080p' },
] as const;
