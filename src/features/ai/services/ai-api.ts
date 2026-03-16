import { getApiKeyByProvider } from '@/features/settings/services/api-keys-storage';

export interface GenerateTextPayload {
  prompt: string;
  system_instruction?: string;
}

export interface GenerateTextResponse {
  text: string;
}

export interface GenerateImagePayload {
  prompt: string;
}

export interface GenerateImageResponse {
  image_bytes: string;
  mime_type: string;
}

/**
 * Get the Gemini API key from localStorage.
 * Throws if not configured.
 */
function getGeminiKey(): string {
  const entry = getApiKeyByProvider('gemini');
  if (!entry?.key) {
    throw new Error('Gemini API key not configured. Go to Settings to add it.');
  }
  return entry.key;
}

/**
 * Generate text via Gemini.
 */
export async function generateText(
  payload: GenerateTextPayload
): Promise<{ data: GenerateTextResponse }> {
  const apiKey = getGeminiKey();

  const res = await fetch('/api/ai/generate-text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      prompt: payload.prompt,
      systemInstruction: payload.system_instruction,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate text');
  }

  return res.json();
}

/**
 * Generate an image via Imagen.
 */
export async function generateImage(
  payload: GenerateImagePayload
): Promise<{ data: GenerateImageResponse }> {
  const apiKey = getGeminiKey();

  const res = await fetch('/api/ai/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ prompt: payload.prompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate image');
  }

  return res.json();
}

/* ── Character Visuals ── */

export interface GenerateCharacterVisualsPayload {
  appearance: string;
  gender?: string;
  age?: number;
  species?: string;
  director_instruction?: string;
  film_style_prompt?: string;
  expressions?: string[];
  custom_instruction?: string;
}

export interface GeneratedVisualImage {
  image_bytes: string;
  mime_type: string;
  expression: string;
}

export interface GenerateCharacterVisualsResponse {
  images: GeneratedVisualImage[];
  count: number;
}

/**
 * Generate character visuals via Imagen API.
 * Produces 4 images with consistent character description across expressions.
 */
export async function generateCharacterVisuals(
  payload: GenerateCharacterVisualsPayload
): Promise<{ data: GenerateCharacterVisualsResponse }> {
  const apiKey = getGeminiKey();

  const res = await fetch('/api/ai/generate-character-visuals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      appearance: payload.appearance,
      gender: payload.gender,
      age: payload.age,
      species: payload.species,
      directorInstruction: payload.director_instruction,
      filmStylePrompt: payload.film_style_prompt,
      expressions: payload.expressions,
      customInstruction: payload.custom_instruction,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate character visuals');
  }

  return res.json();
}

