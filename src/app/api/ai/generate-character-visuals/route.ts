import { NextRequest, NextResponse } from 'next/server';
import { createGenAIClient, buildModelCascade } from '@/lib/genai';

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
 * Generate an image via generateContent with optional reference image.
 * When a reference image is provided, the model is instructed to keep
 * the SAME character identity (face, body, clothes, colors).
 */
async function generateImage(
  ai: ReturnType<typeof createGenAIClient>,
  model: string,
  prompt: string,
  referenceImage?: { data: string; mimeType: string }
): Promise<{ data: string; mimeType: string } | null> {
  const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];

  if (referenceImage) {
    // Attach the reference image first so the model "sees" the character
    parts.push({
      inlineData: {
        data: referenceImage.data,
        mimeType: referenceImage.mimeType,
      },
    });
    parts.push({
      text: `This is a reference image of a character. Generate a NEW portrait of the EXACT SAME character — same face, same skin tone, same hair style and color, same body type, same clothing. Only change the expression and pose as described: ${prompt}. The character must be recognizably the same person.`,
    });
  } else {
    parts.push({ text: prompt });
  }

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts }],
    config: {
      responseModalities: ['IMAGE', 'TEXT'],
    },
  });

  const responseParts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of responseParts) {
    if (part.inlineData?.data) {
      return {
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType ?? 'image/png',
      };
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appearance, gender, age, species, directorInstruction, filmStylePrompt, expressions, customInstruction, model } = body;

    // Build model cascade: user-preferred model first, then fallbacks
    const IMAGE_MODELS = buildModelCascade(model);

    if (!appearance || typeof appearance !== 'string') {
      return NextResponse.json(
        { error: 'Character "appearance" description is required.' },
        { status: 400 }
      );
    }

    const ai = createGenAIClient();

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

    // Build explicit character identity line (type + gender + age)
    const identityParts: string[] = [];
    const charType = species === 'animal' ? 'Animal' : 'Human';
    identityParts.push(`${charType} character`);
    if (gender) identityParts.push(gender);
    if (age) identityParts.push(`${age} years old`);
    const identityLine = identityParts.join(', ');

    // ── Step 1: Generate the FIRST expression (anchor image) ──
    const firstExpr = targetExpressions[0];
    const firstPrompt = [
      `${stylePrefix} character portrait illustration.`,
      `Character identity: ${identityLine}.`,
      `Appearance: ${appearance}.`,
      firstExpr.instruction + '.',
      directorNote,
      customNote,
      'High quality, detailed, professional character concept art.',
    ]
      .filter(Boolean)
      .join(' ');

    let workingModel: string | null = null;
    let anchorImage: { data: string; mimeType: string } | null = null;
    const modelErrors: string[] = [];

    for (const model of IMAGE_MODELS) {
      try {
        console.log(`[generate-character-visuals] Trying model: ${model}`);
        const result = await generateImage(ai, model, firstPrompt);

        if (result) {
          workingModel = model;
          anchorImage = result;
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

    if (!workingModel || !anchorImage) {
      const allQuotaExceeded = modelErrors.length > 0 && modelErrors.every((e) => e.includes('429') || e.toLowerCase().includes('quota'));
      const friendlyError = allQuotaExceeded
        ? 'You have hit the image generation rate limit. Please wait a minute or two and try again.'
        : 'Image generation is temporarily unavailable. Please try again shortly or check your Google Cloud quota settings.';
      console.error('[generate-character-visuals] All models failed:', modelErrors.join(' | '));
      return NextResponse.json({ error: friendlyError }, { status: allQuotaExceeded ? 429 : 400 });
    }

    // ── Step 2: Store the anchor image ──
    const generatedImages: {
      image_bytes: string;
      mime_type: string;
      expression: string;
    }[] = [];
    const errors: string[] = [];

    generatedImages.push({
      image_bytes: anchorImage.data,
      mime_type: anchorImage.mimeType,
      expression: firstExpr.id,
    });

    // ── Step 3: Generate remaining expressions using anchor as reference ──
    const remainingExpressions = targetExpressions.slice(1);

    for (const expr of remainingExpressions) {
      const prompt = [
        `${stylePrefix} character portrait illustration.`,
        `Character identity: ${identityLine}.`,
        `Appearance: ${appearance}.`,
        expr.instruction + '.',
        directorNote,
        customNote,
        'High quality, detailed, professional character concept art.',
      ]
        .filter(Boolean)
        .join(' ');

      try {
        // Rate-limit delay between generations
        await new Promise((r) => setTimeout(r, 1500));

        // Pass anchor image as reference for consistency
        const result = await generateImage(ai, workingModel, prompt, anchorImage);

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
