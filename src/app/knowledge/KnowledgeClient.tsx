'use client';

import React, { useState } from 'react';
import { 
  Database, 
  FolderSync, 
  FileText, 
  Video, 
  Calendar, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Brain
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  source: string;
  source_id: string;
  source_url: string;
  file_type: string;
  summary: string;
  transcript: string;
  keywords: string[];
  topics: string[];
  metadata: any;
  status: string;
  created_at: string;
}

export default function KnowledgeClient({ initialDocuments }: { initialDocuments: Document[] }) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(initialDocuments[0] || null);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'google-drive':
        return <FolderSync className="w-3.5 h-3.5 text-green-400" />;
      default:
        return <Database className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const getFileTypeIcon = (type: string) => {
    if (type.includes('mp4') || type.includes('video')) {
      return <Video className="w-3.5 h-3.5 text-pink-400" />;
    }
    return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#030303]">
      {/* List Pane */}
      <div className="w-5/12 border-r border-[#1f1f23] flex flex-col h-full bg-[#09090b]/40 backdrop-blur-md">
        <div className="p-6 border-b border-[#1f1f23] space-y-1 bg-[#09090b]/30">
          <h1 className="text-base font-bold text-white uppercase tracking-wider">Knowledge Base</h1>
          <p className="text-xs text-zinc-500">Explore summaries, transcripts, and metadata.</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-[#121215]">
          {initialDocuments.length === 0 ? (
            <div className="p-8 text-center text-zinc-650 text-xs">
              No integrated documents found.
            </div>
          ) : (
            initialDocuments.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`w-full text-left p-5 flex items-center justify-between gap-4 transition-all duration-200 border-l-2 cursor-pointer ${
                  selectedDoc?.id === doc.id 
                    ? 'bg-zinc-900/30 border-l-indigo-500' 
                    : 'hover:bg-zinc-900/10 border-l-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center justify-center text-zinc-400 shrink-0">
                    {getFileTypeIcon(doc.file_type)}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="text-xs font-semibold text-white truncate">{doc.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[9px] text-zinc-500 font-medium">
                        {getSourceIcon(doc.source)}
                        <span className="capitalize">{doc.source.replace('-', ' ')}</span>
                      </span>
                      <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
                      <span className="text-[9px] text-zinc-550">{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-650" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Details Pane */}
      <div className="w-7/12 flex flex-col h-full bg-[#030303] overflow-y-auto">
        {selectedDoc ? (
          <div className="p-8 space-y-8">
            {/* Header info */}
            <div className="border-b border-[#1f1f23] pb-6 space-y-4">
              <h2 className="text-lg font-bold text-white tracking-tight leading-snug">{selectedDoc.name}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-950 border border-zinc-850 px-2.5 py-1 rounded-md">
                  {getFileTypeIcon(selectedDoc.file_type)}
                  <span>{selectedDoc.file_type}</span>
                </span>
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-950 border border-zinc-850 px-2.5 py-1 rounded-md">
                  {getSourceIcon(selectedDoc.source)}
                  <span>{selectedDoc.source}</span>
                </span>
                {selectedDoc.source_url && (
                  <a
                    href={selectedDoc.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-1 rounded-md transition-colors ml-auto"
                  >
                    Original Link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* AI Summary Section */}
            <div className="glass-card rounded-xl p-5 space-y-3 border-l-2 border-l-indigo-500/20">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[9px] uppercase tracking-wider">
                <Brain className="w-3.5 h-3.5" />
                <span>AI Summary</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                {selectedDoc.summary || 'AI Summary generating...'}
              </p>
            </div>

            {/* Topics & Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-zinc-555 uppercase tracking-wider block">Topics</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDoc.topics && selectedDoc.topics.length > 0 ? (
                    selectedDoc.topics.map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 px-2.5 py-0.5 rounded-full font-semibold">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-600">None detected</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-bold text-zinc-555 uppercase tracking-wider block">Keywords</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDoc.keywords && selectedDoc.keywords.length > 0 ? (
                    selectedDoc.keywords.map((k, idx) => (
                      <span key={idx} className="text-[9px] bg-zinc-950 border border-zinc-850 text-zinc-400 px-2 py-0.5 rounded font-mono">
                        {k}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-655">None extracted</span>
                  )}
                </div>
              </div>
            </div>

            {/* Transcript / Content */}
            <div className="space-y-3 pt-2">
              <span className="text-[9px] font-bold text-zinc-555 uppercase tracking-wider block">
                {selectedDoc.file_type.includes('mp4') || selectedDoc.file_type.includes('video') ? 'Whisper Audio Transcript' : 'Parsed File Content'}
              </span>
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 max-h-72 overflow-y-auto">
                <p className="text-xs text-zinc-450 leading-relaxed whitespace-pre-wrap font-mono">
                  {selectedDoc.transcript || 'No text content parsed.'}
                </p>
              </div>
            </div>

            {/* Metadata Footer */}
            <div className="pt-6 border-t border-[#1f1f23] grid grid-cols-2 gap-4 text-[9px] text-zinc-600 font-mono uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Indexed: {new Date(selectedDoc.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                ID: {selectedDoc.source_id.slice(0, 12)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 p-8">
            <Database className="w-8 h-8 text-zinc-800 mb-2" />
            <span className="text-xs font-semibold uppercase tracking-wider">Select a file to inspect details</span>
          </div>
        )}
      </div>
    </div>
  );
}
