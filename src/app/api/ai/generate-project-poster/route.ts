import { NextRequest, NextResponse } from 'next/server';
import { createGenAIClient, buildGeminiImageCascade } from '@/lib/genai';
import type { Part } from '@google/genai';

/**
 * Generate a project poster featuring ALL main characters together.
 * Uses Gemini native image generation via `generateContent` on Vertex AI.
 * Character reference images are passed as inline multimodal parts so
 * the model can reproduce accurate likenesses.
 *
 * @see https://cloud.google.com/vertex-ai/generative-ai/docs/models#gemini-models
 */

interface PosterRequest {
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

/* ── Helpers ── */

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const mimeType = res.headers.get('content-type') || 'image/png';
    return { data: Buffer.from(buffer).toString('base64'), mimeType };
  } catch {
    return null;
  }
}

/* ── Route ── */

export async function POST(request: NextRequest) {
  try {
    const body: PosterRequest = await request.json();

    if (!body.characters || body.characters.length === 0) {
      return NextResponse.json(
        { error: 'At least one character is required to generate a poster.' },
        { status: 400 }
      );
    }

    const ai = createGenAIClient();

    // ── Fetch ALL character reference images (1-4 per character) ──
    const charImageParts: Part[] = [];
    for (const ch of body.characters) {
      const urls = ch.reference_image_urls ?? [];
      if (urls.length > 0) {
        charImageParts.push({
          text: `[CHARACTER REFERENCE IMAGES] The following ${urls.length} image(s) show "${ch.name}" from different angles and expressions. The poster MUST depict this character with THIS EXACT face, hair, skin tone, and body type.`,
        });
        for (const url of urls) {
          const img = await fetchImageAsBase64(url);
          if (img) {
            charImageParts.push({
              inlineData: { data: img.data, mimeType: img.mimeType },
            });
          }
        }
      }
    }

    // ── Build enriched style + director context ──
    const styleLines: string[] = [];
    if (body.film_style_name) {
      styleLines.push(`FILM STYLE: "${body.film_style_name}"${body.film_style_category ? ` (${body.film_style_category})` : ''}.`);
    }
    if (body.film_style_description) {
      styleLines.push(`Style description: ${body.film_style_description}.`);
    }
    if (body.film_style_prompt) {
      styleLines.push(`Visual style direction: ${body.film_style_prompt}.`);
    }
    if (styleLines.length === 0) {
      styleLines.push('Cinematic digital art style.');
    }

    const directorLines: string[] = [];
    if (body.director_name) {
      directorLines.push(`DIRECTOR: ${body.director_name}${body.director_style ? ` — known for ${body.director_style}` : ''}.`);
    }
    if (body.director_description) {
      directorLines.push(`Director's aesthetic: ${body.director_description}.`);
    }
    if (body.director_instruction) {
      directorLines.push(`Director's creative instruction: ${body.director_instruction}.`);
    }

    const charDescriptions = body.characters
      .map((c) => {
        const parts = [`"${c.name}"`];
        if (c.gender) parts.push(`(${c.gender}`);
        if (c.age) parts.push(`${c.age} years old)`);
        else if (c.gender) parts.push(')');
        if (c.appearance) parts.push(`— ${c.appearance}`);
        return parts.join(' ');
      })
      .join('; ');

    const posterPrompt = [
      ...styleLines,
      ...directorLines,
      `Create a cinematic movie poster for "${body.project_title}".`,
      body.project_description ? `Story: ${body.project_description}.` : '',
      `The poster MUST feature ALL of these characters together, each clearly visible and identifiable: ${charDescriptions}.`,
      'COMPOSITION: Dramatic movie-poster composition — characters arranged at varying depths, dynamic poses, dramatic cinematic lighting, moody atmospheric background.',
      'CRITICAL: Each character MUST look EXACTLY like their reference image above — same face, hair color, skin tone, clothing, and body type. Do NOT change their appearance.',
      'The entire visual aesthetic (color grading, lighting style, atmosphere, lens effects) must match the film style and director\'s artistic vision described above.',
      'Generate ONE high-quality cinematic movie poster image.',
    ]
      .filter(Boolean)
      .join(' ');

    // ── Build multimodal parts: reference images first, then the prompt ──
    const contentParts: Part[] = [...charImageParts, { text: posterPrompt }];

    // ── Try Gemini image model cascade ──
    const GEMINI_MODELS = buildGeminiImageCascade();

    for (const model of GEMINI_MODELS) {
      try {
        console.log(`[generate-project-poster] Trying Gemini model: ${model}`);

        const result = await ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: contentParts }],
          config: {
            responseModalities: ['IMAGE', 'TEXT'],
          },
        });

        // Extract the generated image from the response
        const parts = result.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            console.log(`[generate-project-poster] ✅ Generated with ${model}`);
            return NextResponse.json({
              data: {
                image_bytes: part.inlineData.data,
                mime_type: part.inlineData.mimeType ?? 'image/png',
              },
            });
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message.substring(0, 120) : String(err);
        console.log(`[generate-project-poster] ❌ ${model}: ${msg}`);
      }
    }

    return NextResponse.json(
      { error: 'Poster generation is temporarily unavailable. Please wait a moment and try again.' },
      { status: 429 }
    );
  } catch (error) {
    console.error('[generate-project-poster] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate project poster.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
