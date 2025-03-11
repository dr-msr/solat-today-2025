'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function translateText(text: string): Promise<string> {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Missing or invalid text parameter');
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator specializing in translating Malay (Bahasa Melayu) to English. Translate the following text accurately while preserving the original meaning and context. Provide only the translated text without any additional explanations.'
        },
        { role: 'user', content: `Translate this Malay text to English: ${text}` }
      ],
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}
