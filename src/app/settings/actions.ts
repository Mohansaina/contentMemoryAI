"use server";

import { getSupabaseServer } from '@/lib/supabase';
import { encrypt } from '@/lib/crypto';
import { revalidatePath } from 'next/cache';
import { inngest } from '@/inngest/client';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function saveOpenAIKey(key: string) {
  'use server';
  try {
    if (!key) {
      throw new Error('Key cannot be empty');
    }

    const encrypted = encrypt(key);
    const supabase = getSupabaseServer(true); // Service role to write settings

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: DEMO_USER_ID,
        encrypted_openai_key: encrypted,
        updated_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save API key' };
  }
}

export async function saveSlackConfig(botToken: string, teamName: string) {
  'use server';
  try {
    if (!botToken || !teamName) {
      throw new Error('Bot Token and Team Name are required');
    }

    const supabase = getSupabaseServer(true);

    const { error } = await supabase
      .from('integrations')
      .upsert({
        user_id: DEMO_USER_ID,
        provider: 'slack',
        credentials: { botToken, teamId: 'T_MOCK_123', teamName },
        status: 'connected',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider'
      });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    revalidatePath('/settings');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save Slack configuration' };
  }
}

export async function connectMockGoogleDrive() {
  'use server';
  try {
    const supabase = getSupabaseServer(true);
    const { error } = await supabase
      .from('integrations')
      .upsert({
        user_id: DEMO_USER_ID,
        provider: 'google-drive',
        credentials: { accessToken: 'mock_token', refreshToken: 'mock_refresh', expiryDate: Date.now() + 3600000 },
        status: 'connected',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider'
      });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Trigger the background poller event in Inngest immediately to sync files
    try {
      await inngest.send({
        name: 'google-drive/poll',
        data: { userId: DEMO_USER_ID }
      });
    } catch (inngestError) {
      console.error('Failed to trigger Inngest background sync:', inngestError);
      // We don't fail the connect operation itself, but log the event sender issue
    }

    revalidatePath('/settings');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to connect Google Drive' };
  }
}

export async function disconnectIntegration(provider: string) {
  'use server';
  try {
    const supabase = getSupabaseServer(true);
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('user_id', DEMO_USER_ID)
      .eq('provider', provider);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    revalidatePath('/settings');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to disconnect integration' };
  }
}

export async function getIntegrations() {
  'use server';
  try {
    const supabase = getSupabaseServer(true);
    const { data, error } = await supabase
      .from('integrations')
      .select('provider, status')
      .eq('user_id', DEMO_USER_ID);
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      success: true,
      googleDrive: data?.some(i => i.provider === 'google-drive' && i.status === 'connected') || false,
      slack: data?.some(i => i.provider === 'slack' && i.status === 'connected') || false
    };
  } catch (error: any) {
    console.error('Error fetching integrations status:', error);
    return { success: false, googleDrive: false, slack: false };
  }
}
