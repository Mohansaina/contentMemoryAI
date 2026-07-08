import { getSupabaseServer } from '@/lib/supabase';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink?: string;
  size?: string;
}

export async function getGoogleDriveClient(userId: string) {
  const supabase = getSupabaseServer(true);
  const { data, error } = await supabase
    .from('integrations')
    .select('credentials')
    .eq('user_id', userId)
    .eq('provider', 'google-drive')
    .maybeSingle();

  if (error || !data?.credentials) {
    throw new Error('Google Drive integration not connected for this user.');
  }

  const credentials = data.credentials as { accessToken?: string; refreshToken?: string; expiryDate?: number };
  
  // Here in a real production app we would use googleapis package:
  // import { google } from 'googleapis';
  // const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  // oauth2Client.setCredentials({ access_token: credentials.accessToken, refresh_token: credentials.refreshToken });
  // return google.drive({ version: 'v3', auth: oauth2Client });
  
  return {
    accessToken: credentials.accessToken,
    // Return standard helper methods
    listFiles: async (folderId?: string): Promise<GoogleDriveFile[]> => {
      // Stub implementation or mock list for visual and flow testing
      return [
        {
          id: 'mock-doc-1',
          name: 'Q3 Financial Goals.gdoc',
          mimeType: 'application/vnd.google-apps.document',
          modifiedTime: new Date().toISOString(),
          webViewLink: 'https://docs.google.com/document/d/mock-doc-1/edit',
        },
        {
          id: 'mock-pdf-1',
          name: 'Marketing Plan 2026.pdf',
          mimeType: 'application/pdf',
          modifiedTime: new Date().toISOString(),
          webViewLink: 'https://drive.google.com/file/d/mock-pdf-1/view',
        },
        {
          id: 'mock-video-1',
          name: 'Startup Pitch Video.mp4',
          mimeType: 'video/mp4',
          modifiedTime: new Date().toISOString(),
          webViewLink: 'https://drive.google.com/file/d/mock-video-1/view',
        }
      ];
    },
    downloadFile: async (fileId: string): Promise<{ data: Buffer; name: string; mimeType: string }> => {
      // Mock contents based on mock file ids
      if (fileId === 'mock-doc-1') {
        return {
          data: Buffer.from('Q3 Finance: Target ARR of $5M. We will launch pricing plans starting from $49/mo. Mention pricing to all enterprise leads.'),
          name: 'Q3 Financial Goals.gdoc',
          mimeType: 'text/plain'
        };
      } else if (fileId === 'mock-pdf-1') {
        return {
          data: Buffer.from('Startup Hooks & Marketing: Best hooks are "How to build an AI layer in 24 hours" and "Why agency owners hate database integrations". Use HSL tailored palettes.'),
          name: 'Marketing Plan 2026.pdf',
          mimeType: 'application/pdf'
        };
      } else if (fileId === 'mock-video-1') {
        // Video file returns mock transcript info or raw video bytes
        return {
          data: Buffer.from('Mock audio data - this would normally be an MP4 file binary'),
          name: 'Startup Pitch Video.mp4',
          mimeType: 'video/mp4'
        };
      }
      throw new Error(`File ${fileId} not found`);
    }
  };
}

export async function connectGoogleDrive(userId: string, authCode: string) {
  const supabase = getSupabaseServer(true);
  
  // Real implementation exchanges authCode for tokens:
  // const { tokens } = await oauth2Client.getToken(authCode);
  const mockCredentials = {
    accessToken: `mock_access_token_${Math.random().toString(36).substr(2)}`,
    refreshToken: `mock_refresh_token_${Math.random().toString(36).substr(2)}`,
    expiryDate: Date.now() + 3600 * 1000
  };

  const { error } = await supabase
    .from('integrations')
    .upsert({
      user_id: userId,
      provider: 'google-drive',
      credentials: mockCredentials,
      status: 'connected',
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,provider'
    });

  if (error) {
    throw new Error(`Failed to save Google Drive integration: ${error.message}`);
  }
}
