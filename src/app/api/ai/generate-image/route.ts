import { NextRequest, NextResponse } from 'next/server';
import { createGenAIClient, IMAGE_MODEL } from '@/lib/genai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'A "prompt" string is required.' },
        { status: 400 }
      );
    }

    const genai = createGenAIClient();
    const response = await genai.models.generateImages({
      model: IMAGE_MODEL,
      prompt,
      config: {
        numberOfImages: 1,
      },
    });

    const image = response.generatedImages?.[0];
    if (!image?.image?.imageBytes) {
      return NextResponse.json(
        { error: 'No image was generated.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        image_bytes: image.image.imageBytes,
        mime_type: image.image.mimeType ?? 'image/png',
      },
    });
  } catch (error) {
    console.error('[generate-image] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    );
  }
}
