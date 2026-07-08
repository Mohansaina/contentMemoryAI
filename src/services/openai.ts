import OpenAI from 'openai';
import { getSupabaseServer } from '@/lib/supabase';
import { decrypt } from '@/lib/crypto';

export async function getUserOpenAIKey(userId: string): Promise<string | null> {
  try {
    const supabase = getSupabaseServer(true); // Service role to read user settings
    const { data, error } = await supabase
      .from('user_settings')
      .select('encrypted_openai_key')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data?.encrypted_openai_key) {
      return null;
    }
    return decrypt(data.encrypted_openai_key);
  } catch (error) {
    console.error('Error fetching/decrypting user OpenAI key:', error);
    return null;
  }
}

export async function getOpenAIClient(userId: string): Promise<OpenAI> {
  const userKey = await getUserOpenAIKey(userId);
  const apiKey = userKey || process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'dummy' || apiKey === 'your-default-openai-key') {
    throw new Error('No OpenAI API Key configured. Please go to Settings and enter your OpenAI API Key.');
  }
  // Point the OpenAI client to Google Gemini's OpenAI-compatibility endpoint
  return new OpenAI({ 
    apiKey, 
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/' 
  });
}

export async function generateEmbedding(text: string, openai: OpenAI): Promise<number[]> {
  const apiKey = openai.apiKey || process.env.OPENAI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: {
        parts: [{ text: text.replace(/\n/g, ' ') }]
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini Embedding API Error: ${res.status} - ${errText}`);
  }

  const json = await res.json();
  if (!json?.embedding?.values) {
    throw new Error(`Invalid response format from Gemini Embedding API: ${JSON.stringify(json)}`);
  }

  return json.embedding.values;
}

export async function transcribeAudio(fileBuffer: Buffer, filename: string, openai: OpenAI): Promise<string> {
  // Convert buffer to a File object for the OpenAI SDK
  const file = await OpenAI.toFile(fileBuffer, filename);
  const response = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: file,
  });
  return response.text;
}

export interface ContentAnalysis {
  summary: string;
  keywords: string[];
  topics: string[];
}

export async function analyzeContent(text: string, openai: OpenAI): Promise<ContentAnalysis> {
  const response = await openai.chat.completions.create({
    model: 'gemini-2.5-flash',
    messages: [
      {
        role: 'system',
        content: `You are an expert content analyzer. You will read the provided content and extract:
1. A concise, professional summary (max 3 sentences).
2. A list of 5-8 relevant keywords.
3. A list of 2-4 primary topics/categories.

Return ONLY a JSON object in this exact format:
{
  "summary": "...",
  "keywords": ["...", "..."],
  "topics": ["...", "..."]
}`
      },
      {
        role: 'user',
        content: text.slice(0, 16000) // Truncate very long texts for safety
      }
    ],
    response_format: { type: 'json_object' }
  });

  const contentStr = response.choices[0].message.content || '{}';
  const parsed = JSON.parse(contentStr);
  return {
    summary: parsed.summary || 'No summary available.',
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    topics: Array.isArray(parsed.topics) ? parsed.topics : []
  };
}
