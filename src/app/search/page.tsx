'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  BrainCircuit, 
  Loader2, 
  ExternalLink, 
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { executeSearch } from './actions';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    documentId: string;
    name: string;
    source: string;
    url: string;
    similarity: number;
  }>;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const suggestions = [
    'Show all finance goals.',
    'Find every mention of pricing.',
    'Summarize our startup pitch.',
    'Which hooks performed best?'
  ];

  const handleSearch = async (textToSearch: string) => {
    if (!textToSearch.trim() || loading) return;
    
    const userMessage: Message = { role: 'user', content: textToSearch };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    const res = await executeSearch(textToSearch);
    
    setLoading(false);
    const assistantMessage: Message = {
      role: 'assistant',
      content: res.answer,
      sources: res.sources || []
    };
    setMessages(prev => [...prev, assistantMessage]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#030303] overflow-hidden">
      {/* Search Header */}
      <div className="h-16 border-b border-[#1f1f23] px-8 flex items-center justify-between shrink-0 bg-[#09090b]/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">AI Search Layer</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full font-mono uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
          <span>Active RAG Engine</span>
        </div>
      </div>

      {/* Messages thread */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto w-full space-y-8">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center space-y-8 py-24">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                <BrainCircuit className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-white">Search Content Memory</h2>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  Query Google Drive and Slack files in natural language.
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md w-full pt-4">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(s)}
                    className="glass-card text-left p-4 rounded-xl text-xs text-zinc-400 hover:text-white flex items-center justify-between group cursor-pointer border border-zinc-850"
                  >
                    <span>{s}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-indigo-400" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {messages.map((m, idx) => (
                <div key={idx} className="space-y-4">
                  {/* User Bubble */}
                  {m.role === 'user' ? (
                    <div className="flex gap-4 items-start bg-zinc-900/30 p-5 rounded-xl border border-zinc-850/40">
                      <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-400 shrink-0">
                        USR
                      </div>
                      <div className="text-xs font-semibold text-white leading-relaxed">{m.content}</div>
                    </div>
                  ) : (
                    // Assistant Bubble
                    <div className="space-y-4 bg-zinc-950/40 p-6 rounded-xl border border-zinc-900/50">
                      <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-md bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-[9px] font-bold text-indigo-400 shrink-0">
                          MEM
                        </div>
                        <div className="space-y-4 flex-1">
                          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{m.content}</p>
                          
                          {/* Citations block */}
                          {m.sources && m.sources.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-zinc-900">
                              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block">Sources Cited</span>
                              <div className="flex flex-wrap gap-2">
                                {m.sources.map((s, sIdx) => (
                                  <a
                                    key={sIdx}
                                    href={s.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-lg text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                                  >
                                    <Database className="w-3 h-3" />
                                    <span className="max-w-[100px] truncate">{s.name}</span>
                                    <span className="text-[9px] text-zinc-600 font-mono">({Math.round(s.similarity * 100)}%)</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-zinc-650" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 items-center justify-center p-8 text-zinc-550 text-xs font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Scanning index & preparing response...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating search input wrapper */}
      <div className="p-6 border-t border-[#1f1f23] bg-[#030303] shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}
          className="max-w-3xl mx-auto w-full relative flex items-center"
        >
          <input
            type="text"
            placeholder="Ask a question about connected content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3.5 pl-4 pr-12 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/5 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-3 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-zinc-900 disabled:text-zinc-600 transition-all border border-indigo-500/20"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
