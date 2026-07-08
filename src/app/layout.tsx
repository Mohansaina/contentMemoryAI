import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Content Memory AI - The Intelligence Layer for Agencies',
  description: 'ChatGPT for your agency\'s entire knowledge base. Sync Google Drive, Slack, and other platforms automatically.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.className} h-full antialiased dark`}>
      <body className="h-full bg-[#030303] text-[#f4f4f5] flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
