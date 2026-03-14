import { NextRequest, NextResponse } from 'next/server';
import { createGenAIClient, TEXT_MODEL } from '@/lib/genai';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required. Add your Gemini key in Settings.' },
        { status: 401 }
      );
    }

    const { prompt, systemInstruction } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'A "prompt" string is required.' },
        { status: 400 }
      );
    }

    const genai = createGenAIClient(apiKey);
    const response = await genai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || undefined,
      },
    });

    return NextResponse.json({
      data: {
        text: response.text ?? '',
      },
    });
  } catch (error) {
    console.error('[generate-text] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate text. Please try again.' },
      { status: 500 }
    );
  }
}
