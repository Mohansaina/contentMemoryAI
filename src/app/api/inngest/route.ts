import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { pollGoogleDrive, processFile } from '@/inngest/functions';

// Serve Inngest client and background functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    pollGoogleDrive,
    processFile,
  ],
});
