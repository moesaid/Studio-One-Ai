import { GoogleGenAI } from '@google/genai';

/** Default text model */
export const TEXT_MODEL = 'gemini-2.5-flash';

/** Default image model */
export const IMAGE_MODEL = 'imagen-3.0-generate-002';

/**
 * Create a Google Gen AI client with the given API key.
 * Used in API routes — each request can have a different key.
 */
export function createGenAIClient(apiKey: string) {
  return new GoogleGenAI({ apiKey });
}
