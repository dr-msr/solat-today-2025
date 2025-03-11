import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { text } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid text parameter' }, { status: 400 });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    // Call OpenAI API for translation
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator specializing in translating Malay (Bahasa Melayu) to English. Translate the following text accurately while preserving the original meaning and context. Provide only the translated text without any additional explanations.'
        },
        { role: 'user', content: `Translate this Malay text to English: ${text}` }
      ],
      temperature: 0.3, // Lower temperature for more consistent translations
    });

    // Extract the translated text from the response
    const translatedText = response.choices[0]?.message?.content?.trim() || '';

    // Return the translated text
    return NextResponse.json({ translatedText });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text', details: (error as Error).message },
      { status: 500 }
    );
  }
}
