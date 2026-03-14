import { NextRequest, NextResponse } from 'next/server';
import { genai, TEXT_MODEL } from '@/lib/genai';

export async function POST(request: NextRequest) {
  try {
    const { prompt, systemInstruction } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'A "prompt" string is required.' },
        { status: 400 }
      );
    }

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
