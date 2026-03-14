import { GoogleGenAI } from '@google/genai';

/**
 * Server-side Google Gen AI client singleton.
 * Only import this in API routes / server components — never in client code.
 */
export const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/** Default text model */
export const TEXT_MODEL = 'gemini-2.5-flash';

/** Default image model */
export const IMAGE_MODEL = 'imagen-3.0-generate-002';
