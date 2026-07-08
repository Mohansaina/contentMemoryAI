import { getSupabaseServer } from '@/lib/supabase';
import { getOpenAIClient, generateEmbedding } from '@/services/openai';

export interface SourceCitation {
  documentId: string;
  name: string;
  source: string;
  url: string;
  similarity: number;
}

export interface RagResult {
  answer: string;
  sources: SourceCitation[];
}

export async function performRagSearch(userId: string, query: string): Promise<RagResult> {
  const supabase = getSupabaseServer(true); // Using service role to run match function
  
  // 1. Get OpenAI client
  let openai;
  try {
    openai = await getOpenAIClient(userId);
  } catch (error: any) {
    return {
      answer: `Unable to process request: ${error.message || 'OpenAI client failed to initialize.'}`,
      sources: []
    };
  }

  // 2. Generate embedding for query
  const queryEmbedding = await generateEmbedding(query, openai);

  // 3. Search database for similar chunks
  const { data: chunks, error: rpcError } = await supabase.rpc('match_document_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: 0.1, // lenient threshold
    match_count: 5,
    filter_user_id: userId
  });

  if (rpcError) {
    console.error('RPC Error matching document chunks:', rpcError);
    throw new Error(`Vector database search failed: ${rpcError.message}`);
  }

  const sources: SourceCitation[] = [];
  const contextParts: string[] = [];

  if (chunks && chunks.length > 0) {
    chunks.forEach((chunk: any) => {
      contextParts.push(`Document: "${chunk.doc_name}" (Source: ${chunk.doc_source})\nContent:\n${chunk.content}`);
      
      // Prevent duplicate sources in citations list
      if (!sources.some(s => s.documentId === chunk.document_id)) {
        sources.push({
          documentId: chunk.document_id,
          name: chunk.doc_name,
          source: chunk.doc_source,
          url: chunk.doc_url || '',
          similarity: chunk.similarity
        });
      }
    });
  }

  const context = contextParts.length > 0
    ? contextParts.join('\n\n---\n\n')
    : 'No relevant documents found in the knowledge base.';

  // 4. Generate answer using chat completions
  const systemPrompt = `You are Content Memory AI, an intelligent assistant that helps agency teams query their internal knowledge base.
You will answer the user's question using the provided context from Google Drive, Slack, and other connected integrations.

Guidelines:
- Answer truthfully based ONLY on the provided context.
- If the context doesn't contain the answer, say "I couldn't find that information in your knowledge base."
- Reference the document name where the information comes from.
- Keep your answers structured, precise, and professional.
- Do not make up facts.

---
CONTEXT:
${context}`;

  const response = await openai.chat.completions.create({
    model: 'gemini-2.5-flash',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query }
    ],
    temperature: 0.2
  });

  const answer = response.choices[0].message.content || 'No response generated.';

  return {
    answer,
    sources
  };
}
