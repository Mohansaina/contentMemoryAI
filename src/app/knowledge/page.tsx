import { getSupabaseServer } from '@/lib/supabase';
import KnowledgeClient from './KnowledgeClient';

export const revalidate = 0; // Fresh database data

export default async function KnowledgePage() {
  const supabase = getSupabaseServer(true);
  let documents: any[] = [];

  try {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      documents = data;
    }
  } catch (error) {
    console.error('Error loading documents for Knowledge Base page:', error);
  }

  // Fallback mock documents if none exist
  if (documents.length === 0) {
    documents = [
      {
        id: 'mock-doc-1',
        name: 'Q3 Financial Goals.gdoc',
        source: 'google-drive',
        source_id: 'mock-doc-1',
        source_url: 'https://docs.google.com',
        file_type: 'gdoc',
        status: 'completed',
        summary: 'Contains the target Q3 ARR goal of $5M and outlines plans for startup pricing changes.',
        transcript: 'Q3 Finance: Target ARR of $5M. We will launch pricing plans starting from $49/mo. Mention pricing to all enterprise leads.',
        keywords: ['finance', 'arr', 'pricing', 'enterprise'],
        topics: ['Finance', 'Strategy'],
        metadata: {},
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'mock-pdf-1',
        name: 'Marketing Plan 2026.pdf',
        source: 'google-drive',
        source_id: 'mock-pdf-1',
        source_url: 'https://drive.google.com',
        file_type: 'pdf',
        status: 'completed',
        summary: 'Details key startup hooks, target audience engagement models, and visual design aesthetics.',
        transcript: 'Startup Hooks & Marketing: Best hooks are "How to build an AI layer in 24 hours" and "Why agency owners hate database integrations". Use HSL tailored palettes.',
        keywords: ['marketing', 'hooks', 'design', 'agency'],
        topics: ['Marketing', 'Brand Guidelines'],
        metadata: {},
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'mock-video-1',
        name: 'Startup Pitch Video.mp4',
        source: 'google-drive',
        source_id: 'mock-video-1',
        source_url: 'https://youtube.com',
        file_type: 'mp4',
        status: 'completed',
        summary: 'Founder pitch video detailing integration-first vision, core features, and architectural layout.',
        transcript: "Hey team, this is our main Q3 strategy presentation. We are building the Content Memory AI. Our goal is to connect to Google Drive, Slack, Notion, and YouTube. The key hooks that work best for startup content are 'How to build an AI layer in 24 hours' and 'Why agency owners hate database integrations'. Make sure the dashboard statistics show connected integrations, recently indexed files, and processing status. Let's launch this fast.",
        keywords: ['pitch', 'vision', 'architecture', 'integration'],
        topics: ['Strategy', 'Pitch Decks'],
        metadata: {},
        created_at: new Date(Date.now() - 10800000).toISOString()
      }
    ];
  }

  return <KnowledgeClient initialDocuments={documents} />;
}
