import { NextRequest, NextResponse } from 'next/server';
import { createGenAIClient, buildGeminiImageCascade } from '@/lib/genai';
import type { Part } from '@google/genai';

/**
 * Generate keyframe images for a scene using Gemini native image generation
 * via `generateContent` with `responseModalities: ['IMAGE', 'TEXT']`.
 * Character reference images + style anchor (project poster) are passed
 * as inline multimodal parts so the model can reproduce accurate likenesses.
 *
 * @see https://cloud.google.com/vertex-ai/generative-ai/docs/models#gemini-models
 */

/* ── Types ── */

interface SceneImageRequest {
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
  model?: string;
  image_model?: string;
  /** base64-encoded project poster for cross-scene consistency */
  style_anchor?: string;
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

async function generateImageFromContent(
  ai: ReturnType<typeof createGenAIClient>,
  models: string[],
  parts: Part[],
): Promise<{ data: string; mimeType: string; model: string } | null> {
  for (const model of models) {
    try {
      const result = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts }],
        config: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      });

      const responseParts = result.candidates?.[0]?.content?.parts || [];
      for (const part of responseParts) {
        if (part.inlineData?.data) {
          console.log(`[generate-scene-images] ✅ Generated with ${model}`);
          return {
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType ?? 'image/png',
            model,
          };
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message.substring(0, 120) : String(err);
      console.log(`[generate-scene-images] ❌ ${model}: ${msg}`);
    }
  }
  return null;
}

/* ── Route ── */

export async function POST(request: NextRequest) {
  try {
    const body: SceneImageRequest = await request.json();

    if (!body.image_prompts || body.image_prompts.length === 0) {
      return NextResponse.json(
        { error: 'image_prompts array is required.' },
        { status: 400 }
      );
    }

    const ai = createGenAIClient();

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

    const sceneContext = [
      `Scene: "${body.scene_title}".`,
      `Location: ${body.location || 'unspecified'}.`,
      `Time: ${body.time_of_day || 'day'}.`,
      `Mood: ${body.mood || 'dramatic'}.`,
      body.visual_description ? `Visual notes: ${body.visual_description}.` : '',
      charDescriptions ? `Characters in this scene (use EXACT appearances from reference images): ${charDescriptions}.` : '',
    ]
      .filter(Boolean)
      .join(' ');

    // ── Fetch ALL character reference images (1-4 per character) ──
    const charImageParts: Part[] = [];
    for (const ch of body.characters) {
      const urls = ch.reference_image_urls ?? [];
      if (urls.length > 0) {
        charImageParts.push({
          text: `[CHARACTER REFERENCE] The following ${urls.length} image(s) show "${ch.name}" from different angles/expressions. All scene images MUST depict this character with THIS EXACT face, hair, skin tone, clothing, and body type.`,
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

    // ── Style anchor from project poster ──
    const styleAnchorParts: Part[] = [];
    if (body.style_anchor) {
      styleAnchorParts.push({
        text: '[PROJECT POSTER / STYLE ANCHOR] This is the project poster showing all characters together. ALL scene images must use the SAME visual style, color palette, and character designs as this poster.',
      });
      styleAnchorParts.push({
        inlineData: { data: body.style_anchor, mimeType: 'image/png' },
      });
    }

    // ── Build Gemini cascade ──
    const GEMINI_MODELS = buildGeminiImageCascade();

    // ── Generate opening shot ──
    const openingPrompt = [
      ...styleLines,
      ...directorLines,
      sceneContext,
      body.image_prompts[0],
      'CRITICAL: Each character MUST look EXACTLY like their reference image — same face, hair, skin tone, clothing. Do NOT change any character\'s appearance.',
      'The entire visual aesthetic (color grading, lighting, atmosphere, lens effects) must match the film style and director\'s artistic vision described above.',
      'Generate ONE high-quality cinematic production still image.',
    ]
      .filter(Boolean)
      .join(' ');

    const openingParts: Part[] = [
      ...styleAnchorParts,
      ...charImageParts,
      { text: openingPrompt },
    ];

    const openingResult = await generateImageFromContent(ai, GEMINI_MODELS, openingParts);

    if (!openingResult) {
      return NextResponse.json(
        { error: 'Scene image generation is temporarily unavailable. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    const generatedImages: {
      image_bytes: string;
      mime_type: string;
      frame_label: string;
    }[] = [];

    // 1) Store the opening image
    generatedImages.push({
      image_bytes: openingResult.data,
      mime_type: openingResult.mimeType,
      frame_label: 'opening',
    });

    // 2) Generate additional frames using the same model + opening shot as within-scene reference
    const workingModel = openingResult.model;

    for (let i = 1; i < body.image_prompts.length; i++) {
      const framePrompt = [
        ...styleLines,
        ...directorLines,
        sceneContext,
        body.image_prompts[i],
        'IMPORTANT: This is the SAME scene as the opening shot. Characters MUST look IDENTICAL — same face, hair, clothing. Only camera angle and action should differ.',
        'The visual aesthetic must match the film style and director\'s vision described above.',
        'Generate ONE high-quality cinematic production still image.',
      ]
        .filter(Boolean)
        .join(' ');

      // Include the opening image as a within-scene reference for consistency
      const frameParts: Part[] = [
        ...styleAnchorParts,
        ...charImageParts,
        {
          text: '[SCENE REFERENCE] This is the opening shot of THIS scene. The new image must show the SAME characters, costumes, environment, and lighting.',
        },
        {
          inlineData: { data: openingResult.data, mimeType: openingResult.mimeType },
        },
        { text: framePrompt },
      ];

      try {
        // Delay for rate limits
        await new Promise((r) => setTimeout(r, 2000));

        const frameResult = await generateImageFromContent(ai, [workingModel], frameParts);

        if (frameResult) {
          generatedImages.push({
            image_bytes: frameResult.data,
            mime_type: frameResult.mimeType,
            frame_label: i === 1 ? 'closing' : `frame_${i + 1}`,
          });
        }
      } catch (err) {
        console.error(`[generate-scene-images] Frame ${i + 1} failed:`, err instanceof Error ? err.message : err);
      }
    }

    return NextResponse.json({
      data: {
        images: generatedImages,
        count: generatedImages.length,
      },
    });
  } catch (error) {
    console.error('[generate-scene-images] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate scene images.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
