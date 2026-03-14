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
 * Generate text via Gemini.
 */
export async function generateText(
  payload: GenerateTextPayload
): Promise<{ data: GenerateTextResponse }> {
  const res = await fetch('/api/ai/generate-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch('/api/ai/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: payload.prompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate image');
  }

  return res.json();
}
