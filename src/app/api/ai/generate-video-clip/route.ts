import { NextRequest, NextResponse } from 'next/server';
import { getVertexAIConfig } from '@/lib/genai-server';

/**
 * POST /api/ai/generate-video-clip
 *
 * Image-to-video generation via Veo REST API (predictLongRunning).
 * Returns the operation name for long-running polling.
 *
 * @see https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      image_base64,
      image_mime_type = 'image/png',
      prompt,
      video_model = 'veo-3.0-generate-001',
      duration = 8,
      aspect_ratio = '16:9',
      resolution = '720p',
      generate_audio = true,
      person_generation = 'allow_adult',
      negative_prompt,
      // Context fields for prompt enrichment
      director_name,
      director_style,
      film_style_name,
      film_style_description,
      scene_title,
      scene_description,
    } = body;

    if (!image_base64 && !prompt) {
      return NextResponse.json(
        { error: 'Either image_base64 or prompt is required.' },
        { status: 400 }
      );
    }

    const { project, location, accessToken } = await getVertexAIConfig();

    // Build raw context for Gemini to rewrite into a Veo-safe prompt
    const rawParts: string[] = [];
    if (director_name && director_style) {
      rawParts.push(
        `Cinematic style inspired by ${director_name}: ${director_style}.`
      );
    }
    if (film_style_name && film_style_description) {
      rawParts.push(
        `Visual style: ${film_style_name} — ${film_style_description}.`
      );
    }
    if (scene_title) {
      rawParts.push(`Scene title: "${scene_title}".`);
    }
    if (scene_description) {
      rawParts.push(`Scene visual context: ${scene_description}`);
    }
    if (prompt) {
      rawParts.push(prompt);
    }

    const rawPrompt = rawParts.join(' ');

    // Use Gemini to rewrite the prompt into safe, cinematographic language for Veo
    let enrichedPrompt = rawPrompt;
    try {
      const geminiEndpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/gemini-2.0-flash:generateContent`;

      const sanitizeResponse = await fetch(geminiEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are a prompt engineer for a video generation AI (Veo by Google). 
Rewrite the following scene description into a purely VISUAL and CINEMATIC prompt suitable for Veo video generation.

RULES:
- Focus ONLY on: camera angles, camera movement, lighting, color palette, atmosphere, visual composition, textures, environment details
- REMOVE all: dialogue, character names, plot points, violence references, weapons, blood, conflict descriptions, emotional drama
- Replace any action scenes with abstract cinematic language (e.g. "dynamic motion" instead of "fight")
- Keep it under 200 words
- Write as a single flowing paragraph
- Make it feel like a cinematographer's shot description

INPUT:
${rawPrompt}

OUTPUT (cinematic prompt only, no explanations):`,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.3,
          },
        }),
      });

      if (sanitizeResponse.ok) {
        const geminiResult = await sanitizeResponse.json();
        const rewrittenText =
          geminiResult.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (rewrittenText) {
          enrichedPrompt = rewrittenText;
          console.log('[generate-video-clip] Sanitized prompt:', enrichedPrompt);
        }
      } else {
        console.warn(
          '[generate-video-clip] Gemini sanitization failed, using raw prompt'
        );
      }
    } catch (sanitizeErr) {
      console.warn(
        '[generate-video-clip] Prompt sanitization error, using raw prompt:',
        sanitizeErr
      );
    }

    // Build the instance for Veo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance: Record<string, any> = {
      prompt: enrichedPrompt,
    };

    // Image-to-video: image goes at top level of the instance
    if (image_base64) {
      instance.image = {
        bytesBase64Encoded: image_base64,
        mimeType: image_mime_type,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parameters: Record<string, any> = {
      aspectRatio: aspect_ratio,
      durationSeconds: duration,
      sampleCount: 1,
      personGeneration: person_generation,
    };

    // Resolution is Veo 3+ only
    if (video_model.startsWith('veo-3')) {
      parameters.resolution = resolution;
    }

    // generateAudio is Veo 3+ only
    if (video_model.startsWith('veo-3')) {
      parameters.generateAudio = generate_audio;
    }

    if (negative_prompt) {
      parameters.negativePrompt = negative_prompt;
    }

    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${video_model}:predictLongRunning`;

    console.log('[generate-video-clip] Calling Veo:', {
      endpoint,
      model: video_model,
      hasImage: !!image_base64,
      image_mime_type,
      promptLength: enrichedPrompt.length,
      parameters,
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [instance],
        parameters,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-video-clip] Veo API error:', response.status, errorText);

      // Try to parse error for a user-friendly message
      let errorMessage = `Veo API error (${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // If not JSON, use the raw text (truncated)
        if (errorText.length > 200) {
          errorMessage = errorText.slice(0, 200) + '…';
        } else {
          errorMessage = errorText || errorMessage;
        }
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      operation_name: result.name,
    });
  } catch (err) {
    console.error('[generate-video-clip] Error:', err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while starting video generation.',
      },
      { status: 500 }
    );
  }
}
