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
 * Generate text via Vertex AI (Gemini).
 */
export async function generateText(
  payload: GenerateTextPayload
): Promise<{ data: GenerateTextResponse }> {
  const res = await fetch('/api/ai/generate-text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
 * Generate an image via Vertex AI (Imagen).
 */
export async function generateImage(
  payload: GenerateImagePayload
): Promise<{ data: GenerateImageResponse }> {
  const res = await fetch('/api/ai/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
  model?: string;
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
 * Generate character visuals via Vertex AI image generation pipeline.
 * Produces 4 images with consistent character description across expressions.
 */
export async function generateCharacterVisuals(
  payload: GenerateCharacterVisualsPayload
): Promise<{ data: GenerateCharacterVisualsResponse }> {
  const res = await fetch('/api/ai/generate-character-visuals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
      model: payload.model,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate character visuals');
  }

  return res.json();
}

/* ── Scene Images ── */

export interface GenerateSceneImagesPayload {
  scene_title: string;
  visual_description: string;
  location: string;
  time_of_day: string;
  mood: string;
  image_prompts: string[];
  characters: {
    name: string;
    appearance: string;
    gender?: string;
    age?: number;
    reference_image_urls?: string[];
  }[];
  film_style_prompt: string;
  film_style_name?: string;
  film_style_category?: string;
  film_style_description?: string;
  director_instruction: string;
  director_name?: string;
  director_style?: string;
  director_description?: string;
  image_model?: string;
  /** base64-encoded project poster, used as style anchor for consistency */
  style_anchor?: string;
}

export interface GeneratedSceneImage {
  image_bytes: string;
  mime_type: string;
  frame_label: string;
}

export interface GenerateSceneImagesResponse {
  images: GeneratedSceneImage[];
  count: number;
}

/**
 * Generate keyframe images for a scene using the Vertex AI image generation pipeline.
 */
export async function generateSceneImages(
  payload: GenerateSceneImagesPayload
): Promise<{ data: GenerateSceneImagesResponse }> {
  const res = await fetch('/api/ai/generate-scene-images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate scene images');
  }

  return res.json();
}

/* ── Project Poster ── */

export interface GenerateProjectPosterPayload {
  project_title: string;
  project_description: string;
  characters: {
    name: string;
    appearance: string;
    gender?: string;
    age?: number;
    reference_image_urls?: string[];
  }[];
  film_style_prompt: string;
  film_style_name?: string;
  film_style_category?: string;
  film_style_description?: string;
  director_instruction: string;
  director_name?: string;
  director_style?: string;
  director_description?: string;
  image_model?: string;
}

export interface GenerateProjectPosterResponse {
  image_bytes: string;
  mime_type: string;
}

/**
 * Generate a project poster featuring all main characters.
 * Used as project thumbnail and style anchor for scene consistency.
 */
export async function generateProjectPoster(
  payload: GenerateProjectPosterPayload
): Promise<{ data: GenerateProjectPosterResponse }> {
  const res = await fetch('/api/ai/generate-project-poster', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate project poster');
  }

  return res.json();
}

/* ── Video Clip Generation (Veo) ── */

export interface GenerateVideoClipPayload {
  image_base64?: string;
  image_mime_type?: string;
  prompt?: string;
  video_model?: string;
  duration?: number;
  aspect_ratio?: string;
  resolution?: string;
  generate_audio?: boolean;
  person_generation?: string;
  negative_prompt?: string;
  director_name?: string;
  director_style?: string;
  film_style_name?: string;
  film_style_description?: string;
  scene_title?: string;
  scene_description?: string;
}

export async function generateVideoClip(
  payload: GenerateVideoClipPayload
): Promise<{ operation_name: string }> {
  const res = await fetch('/api/ai/generate-video-clip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to start video generation');
  }

  return res.json();
}

/* ── Poll Video Operation ── */

export interface PollVideoOperationResponse {
  done: boolean;
  videos?: { gcs_uri: string | null; bytes_base64: string | null; mime_type: string }[];
  error?: string;
}

export async function pollVideoOperation(
  operationName: string
): Promise<PollVideoOperationResponse> {
  const res = await fetch('/api/ai/poll-video-operation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation_name: operationName }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to poll video operation');
  }

  return res.json();
}

/* ── Music Generation (Lyria) ── */

export interface GenerateMusicPayload {
  prompt: string;
  negative_prompt?: string;
  director_name?: string;
  director_style?: string;
  film_style_name?: string;
  scene_title?: string;
  scene_mood?: string;
}

export interface GenerateMusicResponse {
  audio_content: string;
  mime_type: string;
}

export async function generateMusic(
  payload: GenerateMusicPayload
): Promise<GenerateMusicResponse> {
  const res = await fetch('/api/ai/generate-music', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate music');
  }

  return res.json();
}
