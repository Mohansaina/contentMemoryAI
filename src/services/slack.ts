import { getSupabaseServer } from '@/lib/supabase';
import { performRagSearch } from '@/services/search';

export async function connectSlack(userId: string, botToken: string, teamId: string, teamName: string) {
  const supabase = getSupabaseServer(true);
  const credentials = {
    botToken,
    teamId,
    teamName
  };

  const { error } = await supabase
    .from('integrations')
    .upsert({
      user_id: userId,
      provider: 'slack',
      credentials,
      status: 'connected',
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,provider'
    });

  if (error) {
    throw new Error(`Failed to save Slack integration: ${error.message}`);
  }
}

export async function handleSlackMessage(userId: string, channelId: string, text: string, threadTs?: string) {
  try {
    // 1. Remove bot mention from text (e.g. <@U12345> Find pricing -> Find pricing)
    const cleanQuery = text.replace(/<@[A-Z0-9]+>/g, '').trim();
    if (!cleanQuery) return 'How can I help you today? Ask me anything about your connected knowledge base!';

    // 2. Perform RAG search to find context and answer
    const response = await performRagSearch(userId, cleanQuery);
    
    // In production, we'd call the Slack web API here:
    // const client = new WebClient(credentials.botToken);
    // await client.chat.postMessage({ channel: channelId, thread_ts: threadTs, text: response.answer });

    return response.answer;
  } catch (error: any) {
    console.error('Error handling Slack message:', error);
    return `Sorry, I encountered an error processing that request: ${error.message}`;
  }
}
