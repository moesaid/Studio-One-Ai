import { NextRequest, NextResponse } from 'next/server';
import { createGenAIClient } from '@/lib/genai';

/**
 * Character visual generation using Gemini 2.5 Flash with native
 * image output via generateContent + responseModalities.
 *
 * Falls back through multiple models to find one that works
 * on the user's current API tier.
 */
const IMAGE_MODELS = [
  'gemini-2.5-flash',          // 5 RPM / 20 RPD on free tier
  'gemini-2.0-flash',          // fallback
  'imagen-4.0-generate-001',   // requires paid plan
];

/**
 * The 4 expressions we generate for character visual consistency.
 */
const EXPRESSIONS = [
  {
    id: 'neutral',
    label: 'Neutral portrait',
    instruction:
      'looking directly at the viewer with a calm neutral expression, studio lighting, clean solid-color background',
  },
  {
    id: 'happy',
    label: 'Happy / Smiling',
    instruction:
      'with a warm genuine smile, slight head tilt, studio lighting, clean solid-color background',
  },
  {
    id: 'serious',
    label: 'Serious / Dramatic',
    instruction:
      'with a serious dramatic expression, intense gaze, cinematic lighting with shadows, clean solid-color background',
  },
  {
    id: 'profile',
    label: 'Profile / Side view',
    instruction:
      'seen from the side in a three-quarter profile view, studio lighting, clean solid-color background',
  },
];

/**
 * Try generateContent with image modalities on a Gemini model.
 */
async function tryGenerateContent(
  ai: ReturnType<typeof createGenAIClient>,
  model: string,
  prompt: string
): Promise<{ data: string; mimeType: string } | null> {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseModalities: ['IMAGE', 'TEXT'],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return {
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType ?? 'image/png',
      };
    }
  }
  return null;
}

/**
 * Try generateImages with an Imagen model.
 */
async function tryGenerateImages(
  ai: ReturnType<typeof createGenAIClient>,
  model: string,
  prompt: string
): Promise<{ data: string; mimeType: string } | null> {
  const response = await ai.models.generateImages({
    model,
    prompt,
    config: { numberOfImages: 1 },
  });

  const image = response.generatedImages?.[0];
  if (image?.image?.imageBytes) {
    const bytes = image.image.imageBytes;
    return {
      data:
        typeof bytes === 'string'
          ? bytes
          : Buffer.from(bytes).toString('base64'),
      mimeType: 'image/png',
    };
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required. Add your Gemini key in Settings.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { appearance, gender, age, species, directorInstruction, filmStylePrompt, expressions, customInstruction } = body;

    if (!appearance || typeof appearance !== 'string') {
      return NextResponse.json(
        { error: 'Character "appearance" description is required.' },
        { status: 400 }
      );
    }

    const ai = createGenAIClient(apiKey);

    const stylePrefix = filmStylePrompt
      ? `${filmStylePrompt} style`
      : 'Cinematic digital art style';

    const directorNote = directorInstruction
      ? ` Creative direction: ${directorInstruction}.`
      : '';

    const customNote = customInstruction
      ? ` Additional instruction: ${customInstruction}.`
      : '';

    // Filter expressions if specific ones requested
    const targetExpressions = Array.isArray(expressions) && expressions.length > 0
      ? EXPRESSIONS.filter((e) => expressions.includes(e.id))
      : EXPRESSIONS;

    // Find a working model by trying the first expression
    let workingModel: string | null = null;
    let useImagen = false;
    // Build character identity prefix from gender + age
    const identityParts: string[] = [];
    if (species === 'animal') identityParts.push('animal character');
    if (gender) identityParts.push(gender);
    if (age) identityParts.push(`${age} years old`);
    const identityPrefix = identityParts.length > 0 ? `${identityParts.join(', ')} ` : '';

    const probeExpr = targetExpressions[0];
    const firstPrompt = [
      `${stylePrefix} character portrait illustration.`,
      `Character: ${identityPrefix}${appearance}.`,
      probeExpr.instruction + '.',
      directorNote,
      customNote,
      'High quality, detailed, professional character concept art.',
    ]
      .filter(Boolean)
      .join(' ');

    const modelErrors: string[] = [];

    for (const model of IMAGE_MODELS) {
      const isImagen = model.startsWith('imagen');
      try {
        console.log(`[generate-character-visuals] Trying model: ${model}`);
        const result = isImagen
          ? await tryGenerateImages(ai, model, firstPrompt)
          : await tryGenerateContent(ai, model, firstPrompt);

        if (result) {
          workingModel = model;
          useImagen = isImagen;
          console.log(`[generate-character-visuals] ✅ Model works: ${model}`);
          break;
        } else {
          modelErrors.push(`${model}: no image returned`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        modelErrors.push(`${model}: ${msg.substring(0, 150)}`);
        console.log(`[generate-character-visuals] ❌ Model failed: ${model} — ${msg.substring(0, 100)}`);
      }
    }

    if (!workingModel) {
      return NextResponse.json(
        {
          error: `No image generation model available on your current plan. Tried: ${modelErrors.join(' | ')}. Please enable billing at https://ai.dev/projects to unlock image generation.`,
        },
        { status: 400 }
      );
    }

    // Now generate all 4 expressions with the working model
    // (skip the first one if we already got it from the probe)
    const generatedImages: {
      image_bytes: string;
      mime_type: string;
      expression: string;
    }[] = [];
    const errors: string[] = [];

    for (const expr of targetExpressions) {
      const prompt = [
        `${stylePrefix} character portrait illustration.`,
        `Character: ${identityPrefix}${appearance}.`,
        expr.instruction + '.',
        directorNote,
        customNote,
        'High quality, detailed, professional character concept art.',
      ]
        .filter(Boolean)
        .join(' ');

      try {
        const result = useImagen
          ? await tryGenerateImages(ai, workingModel, prompt)
          : await tryGenerateContent(ai, workingModel, prompt);

        if (result) {
          generatedImages.push({
            image_bytes: result.data,
            mime_type: result.mimeType,
            expression: expr.id,
          });
        } else {
          errors.push(`[${expr.id}] No image returned`);
        }
      } catch (exprError) {
        const msg =
          exprError instanceof Error ? exprError.message : String(exprError);
        errors.push(`[${expr.id}] ${msg.substring(0, 300)}`);
        console.error(
          `[generate-character-visuals] Failed ${expr.id}:`,
          msg
        );
      }
    }

    if (generatedImages.length === 0) {
      return NextResponse.json(
        {
          error: `Image generation failed with ${workingModel}. Details: ${errors.join(' | ')}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        images: generatedImages,
        count: generatedImages.length,
      },
    });
  } catch (error) {
    console.error('[generate-character-visuals] Error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to generate character visuals.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
