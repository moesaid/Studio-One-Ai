import { NextRequest, NextResponse } from 'next/server';
import { getVertexAIConfig } from '@/lib/genai-server';

/**
 * POST /api/ai/poll-video-operation
 *
 * Polls a Veo long-running operation using the fetchPredictOperation endpoint.
 *
 * The Veo API requires using fetchPredictOperation (POST) on the model endpoint,
 * NOT a GET on the operation resource directly.
 *
 * Endpoint:
 *   POST https://{LOCATION}-aiplatform.googleapis.com/v1/
 *     projects/{PROJECT_ID}/locations/{LOCATION}/publishers/google/models/{MODEL_ID}:fetchPredictOperation
 *
 * Body:
 *   { "operationName": "projects/.../publishers/google/models/.../operations/{OPERATION_ID}" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { operation_name } = body;

    if (!operation_name) {
      return NextResponse.json(
        { error: 'operation_name is required.' },
        { status: 400 }
      );
    }

    const { project, location, accessToken } = await getVertexAIConfig();

    // Extract the model ID from the operation name.
    // Format: projects/{pid}/locations/{loc}/publishers/google/models/{modelId}/operations/{opId}
    const modelMatch = operation_name.match(
      /publishers\/google\/models\/([^/]+)\/operations\//
    );
    const modelId = modelMatch?.[1];

    if (!modelId) {
      console.error(
        '[poll-video-operation] Could not extract model ID from operation_name:',
        operation_name
      );
      return NextResponse.json(
        {
          error: `Invalid operation name format: ${operation_name}`,
        },
        { status: 400 }
      );
    }

    // Use the fetchPredictOperation endpoint (POST) — this is required for Veo LROs
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${modelId}:fetchPredictOperation`;

    console.log('[poll-video-operation] Polling endpoint:', endpoint);
    console.log('[poll-video-operation] Operation name:', operation_name);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: operation_name,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        '[poll-video-operation] Error:',
        response.status,
        errorText
      );

      let errorMessage = `Poll error (${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        errorMessage = errorText.slice(0, 200) || errorMessage;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const result = await response.json();

    if (result.done) {
      // Check for error in operation
      if (result.error) {
        return NextResponse.json({
          done: true,
          error: result.error.message || 'Video generation failed.',
        });
      }

      const videoResponse = result.response;
      const videos = videoResponse?.videos || [];
      const raiFiltered = videoResponse?.raiMediaFilteredCount || 0;

      if (videos.length === 0 && raiFiltered > 0) {
        return NextResponse.json({
          done: true,
          error:
            'The generated video was filtered by safety checks. Please adjust your scene and try again.',
        });
      }

      return NextResponse.json({
        done: true,
        videos: videos.map(
          (v: {
            gcsUri?: string;
            bytesBase64Encoded?: string;
            mimeType: string;
          }) => ({
            gcs_uri: v.gcsUri || null,
            bytes_base64: v.bytesBase64Encoded || null,
            mime_type: v.mimeType,
          })
        ),
      });
    }

    // Not done yet
    return NextResponse.json({
      done: false,
    });
  } catch (err) {
    console.error('[poll-video-operation] Error:', err);
    return NextResponse.json(
      {
        error:
          'An unexpected error occurred while polling video operation.',
      },
      { status: 500 }
    );
  }
}
