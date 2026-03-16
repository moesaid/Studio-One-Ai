import { NextRequest, NextResponse } from 'next/server';
import { getVertexAIConfig } from '@/lib/genai-server';

/**
 * POST /api/ai/generate-music
 *
 * Generates a 30-second instrumental music clip via Lyria API.
 * Returns base64-encoded WAV audio.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      negative_prompt,
      // Context fields for prompt enrichment
      director_name,
      director_style,
      film_style_name,
      scene_title,
      scene_mood,
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'prompt is required.' },
        { status: 400 }
      );
    }

    const { project, location, accessToken } = await getVertexAIConfig();

    // Build enriched music prompt
    const promptParts: string[] = [];
    if (film_style_name) {
      promptParts.push(`Music for a ${film_style_name} film.`);
    }
    if (director_name && director_style) {
      promptParts.push(
        `In the cinematic style of ${director_name} (${director_style}).`
      );
    }
    if (scene_title) {
      promptParts.push(`Scene: "${scene_title}".`);
    }
    if (scene_mood) {
      promptParts.push(`Mood: ${scene_mood}.`);
    }
    promptParts.push(prompt);

    const enrichedPrompt = promptParts.join(' ');

    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/lyria-002:predict`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance: Record<string, any> = {
      prompt: enrichedPrompt,
    };

    if (negative_prompt) {
      instance.negative_prompt = negative_prompt;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [instance],
        parameters: {},
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[generate-music] Lyria API error:', errorData);

      if (response.status === 429) {
        return NextResponse.json(
          {
            error:
              'Music generation is temporarily unavailable due to high demand. Please wait a minute and try again.',
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error:
            'Failed to generate music. Please check your Vertex AI configuration and try again.',
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    const predictions = result.predictions || [];

    if (predictions.length === 0) {
      return NextResponse.json(
        { error: 'No audio was generated. Please try a different prompt.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      audio_content: predictions[0].audioContent,
      mime_type: predictions[0].mimeType || 'audio/wav',
    });
  } catch (err) {
    console.error('[generate-music] Error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating music.' },
      { status: 500 }
    );
  }
}
