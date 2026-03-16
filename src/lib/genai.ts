import { GoogleGenAI } from '@google/genai';

/** Default text model */
export const TEXT_MODEL = 'gemini-2.5-flash';

/** Default image model (Imagen via Vertex AI) */
export const IMAGE_MODEL = 'imagen-4.0-generate-001';

/**
 * Available Imagen models on Vertex AI.
 * @see https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/imagen-api
 */
export const IMAGE_MODELS = [
  // ── Imagen 4.0 ──
  {
    id: 'imagen-4.0-generate-001',
    label: 'Imagen 4.0',
    description: 'High quality, balanced speed & fidelity',
    tier: 'paid' as const,
  },
  {
    id: 'imagen-4.0-fast-generate-001',
    label: 'Imagen 4.0 Fast',
    description: 'Fastest Imagen 4 variant, lower cost',
    tier: 'paid' as const,
  },
  {
    id: 'imagen-4.0-ultra-generate-001',
    label: 'Imagen 4.0 Ultra',
    description: 'Best quality, highest fidelity',
    tier: 'paid' as const,
  },
  // ── Imagen 3.0 ──
  {
    id: 'imagen-3.0-generate-002',
    label: 'Imagen 3.0 v2',
    description: 'Imagen 3 latest stable release',
    tier: 'paid' as const,
  },
  {
    id: 'imagen-3.0-generate-001',
    label: 'Imagen 3.0',
    description: 'Imagen 3 original release',
    tier: 'paid' as const,
  },
  {
    id: 'imagen-3.0-fast-generate-001',
    label: 'Imagen 3.0 Fast',
    description: 'Fast Imagen 3 variant, lower cost',
    tier: 'paid' as const,
  },
  {
    id: 'imagen-3.0-capability-001',
    label: 'Imagen 3.0 Capability',
    description: 'Editing & upscaling capabilities',
    tier: 'paid' as const,
  },
] as const;

export type ImageModelId = (typeof IMAGE_MODELS)[number]['id'];

/**
 * Gemini models that support native image generation via `generateContent`
 * with `responseModalities: ['IMAGE', 'TEXT']`.
 * These accept inline multimodal references (images), making them ideal
 * for poster + scene generation where character reference images are needed.
 *
 * @see https://cloud.google.com/vertex-ai/generative-ai/docs/models#gemini-models
 */
export const GEMINI_IMAGE_MODELS = [
  {
    id: 'gemini-2.5-flash-preview-image-generation',
    label: 'Gemini 2.5 Flash Image',
    description: 'Stable Gemini model with native image output',
  },
  {
    id: 'gemini-2.0-flash-preview-image-generation',
    label: 'Gemini 2.0 Flash Image',
    description: 'Gemini 2.0 with image generation preview',
  },
] as const;

export type GeminiImageModelId = (typeof GEMINI_IMAGE_MODELS)[number]['id'];

/** localStorage key for persisted model preference */
const MODEL_PREF_KEY = 'studio-one-image-model';

/** Get user's preferred image model from localStorage, or the default */
export function getPreferredImageModel(): ImageModelId {
  if (typeof window === 'undefined') return IMAGE_MODELS[0].id;
  try {
    const stored = localStorage.getItem(MODEL_PREF_KEY);
    if (stored && IMAGE_MODELS.some((m) => m.id === stored)) {
      return stored as ImageModelId;
    }
  } catch { /* ignore */ }
  return IMAGE_MODELS[0].id;
}

/** Persist user's preferred image model */
export function setPreferredImageModel(modelId: ImageModelId): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MODEL_PREF_KEY, modelId);
  } catch { /* ignore */ }
}

/**
 * Build the ordered Imagen model cascade for a given preferred model.
 * Used for character visual generation via `generateImages`.
 */
export function buildModelCascade(preferredId?: string): string[] {
  const preferred = preferredId && IMAGE_MODELS.some((m) => m.id === preferredId)
    ? preferredId
    : IMAGE_MODELS[0].id;
  const others = IMAGE_MODELS.map((m) => m.id).filter((id) => id !== preferred);
  return [preferred, ...others];
}

/**
 * Build the ordered Gemini image model cascade.
 * Used for poster + scene image generation via `generateContent`
 * where inline reference images are required.
 */
export function buildGeminiImageCascade(): string[] {
  return GEMINI_IMAGE_MODELS.map((m) => m.id);
}

/**
 * Create a Google Gen AI client configured for Vertex AI.
 * Reads project / location from server-side environment variables.
 * Used in API routes only (server-side).
 *
 * @see https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference
 */
export function createGenAIClient() {
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

  if (!project) {
    throw new Error(
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set. Cannot initialise Vertex AI client.'
    );
  }

  return new GoogleGenAI({
    vertexai: true,
    project,
    location,
  });
}
