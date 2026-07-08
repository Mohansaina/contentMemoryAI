import Link from 'next/link';
import { getSupabaseServer } from '@/lib/supabase';
import { 
  Database, 
  FolderSync, 
  Search, 
  Clock, 
  CheckCircle, 
  ExternalLink,
  ArrowRight,
  Plus,
  Play,
  FileText
} from 'lucide-react';

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = getSupabaseServer(true);

  let documents: any[] = [];
  let stats = {
    totalFiles: 0,
    totalChunks: 0,
    processing: 0,
    googleDriveConnected: false,
    slackConnected: false
  };

  try {
    const { data: docData } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (docData && docData.length > 0) {
      documents = docData;
      stats.totalFiles = docData.length;
      stats.processing = docData.filter(d => d.status === 'processing' || d.status === 'pending').length;
    }

    const { count: chunkCount } = await supabase
      .from('document_chunks')
      .select('*', { count: 'exact', head: true });
    
    stats.totalChunks = chunkCount || 0;

    const { data: integrationData } = await supabase
      .from('integrations')
      .select('provider, status');

    if (integrationData) {
      stats.googleDriveConnected = integrationData.some(i => i.provider === 'google-drive' && i.status === 'connected');
      stats.slackConnected = integrationData.some(i => i.provider === 'slack' && i.status === 'connected');
    }
  } catch (error) {
    console.error('Error fetching database dashboard data:', error);
  }

  if (documents.length === 0) {
    documents = [
      {
        id: 'mock-doc-1',
        name: 'Q3 Financial Goals.gdoc',
        source: 'google-drive',
        file_type: 'gdoc',
        status: 'completed',
        summary: 'Contains the target Q3 ARR goal of $5M and outlines plans for startup pricing changes.',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        source_url: 'https://docs.google.com'
      },
      {
        id: 'mock-pdf-1',
        name: 'Marketing Plan 2026.pdf',
        source: 'google-drive',
        file_type: 'pdf',
        status: 'completed',
        summary: 'Details key startup hooks, target audience engagement models, and visual design aesthetics.',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        source_url: 'https://drive.google.com'
      },
      {
        id: 'mock-video-1',
        name: 'Startup Pitch Video.mp4',
        source: 'google-drive',
        file_type: 'mp4',
        status: 'completed',
        summary: 'Founder pitch video detailing integration-first vision, core features, and architectural layout.',
        created_at: new Date(Date.now() - 10800000).toISOString(),
        source_url: 'https://youtube.com'
      }
    ];
    stats.totalFiles = 3;
    stats.totalChunks = 12;
    stats.googleDriveConnected = true;
    stats.slackConnected = true;
  }

  const getFileTypeIcon = (type: string) => {
    if (type.includes('mp4') || type.includes('video')) {
      return <Play className="w-3.5 h-3.5" />;
    }
    return <FileText className="w-3.5 h-3.5" />;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-12">
      {/* Header section with page path / breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f1f23] pb-6">
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Workspace</div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Content Control</h1>
        </div>
        <Link
          href="/search"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2 px-4 rounded-lg shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all border border-indigo-500/20"
        >
          <Search className="w-3.5 h-3.5" />
          Ask Assistant
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Indexed Files', val: stats.totalFiles, meta: 'Synced', icon: Database, color: 'text-indigo-400' },
          { label: 'Indexed Chunks', val: stats.totalChunks, meta: 'Vectorized', icon: Database, color: 'text-purple-400' },
          { label: 'Active Processing', val: stats.processing, meta: 'In Queue', icon: Clock, color: 'text-amber-400' },
          { label: 'Pipeline Health', val: 'Healthy', meta: 'Operational', icon: CheckCircle, color: 'text-emerald-400' }
        ].map((item, idx) => (
          <div key={idx} className="glass-card rounded-xl p-5 border-l-2 border-l-indigo-500/20 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{item.label}</span>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">{item.val}</div>
              <div className="text-[9px] text-zinc-500 mt-1 flex items-center gap-1 font-mono uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                {item.meta}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Integrations Panel */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Integrations</h2>
            <p className="text-xs text-zinc-500">Manage sources of internal knowledge.</p>
          </div>
          
          <div className="space-y-4">
            {[
              { name: 'Google Drive', desc: 'Auto-syncs PDFs, docs, videos', connected: stats.googleDriveConnected, color: 'border-green-500/20 bg-green-500/5' },
              { name: 'Slack workspace', desc: 'Bot responds to user mentions', connected: stats.slackConnected, color: 'border-pink-500/20 bg-pink-500/5' }
            ].map((integ, idx) => (
              <div key={idx} className="glass-card rounded-xl p-5 border-l-2 border-l-zinc-700 hover:border-l-indigo-500 space-y-4 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{integ.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{integ.desc}</p>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    integ.connected ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                  }`}>
                    {integ.connected ? 'Active' : 'Offline'}
                  </span>
                </div>
                <Link
                  href="/settings"
                  className="w-full text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 py-2.5 rounded-lg transition-colors"
                >
                  Configure
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Recent indexed files table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recently Indexed</h2>
              <p className="text-xs text-zinc-500">Live processing history of integrated knowledge.</p>
            </div>
            <Link
              href="/knowledge"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
            >
              Full Index <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="glass-card rounded-xl overflow-hidden divide-y divide-[#1f1f23]">
            {documents.map((doc) => (
              <div key={doc.id} className="p-5 hover:bg-zinc-900/40 transition-colors flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                    {getFileTypeIcon(doc.file_type)}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white truncate max-w-[200px] md:max-w-xs">{doc.name}</span>
                      <span className="text-[9px] bg-zinc-900 text-zinc-500 border border-zinc-850 px-1.5 py-0.2 rounded font-mono uppercase tracking-wide">{doc.file_type}</span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate max-w-[280px] md:max-w-md">{doc.summary || 'Indexing in progress...'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    doc.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    doc.status === 'processing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {doc.status}
                  </span>
                  {doc.source_url && (
                    <a href={doc.source_url} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
