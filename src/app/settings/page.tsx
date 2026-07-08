'use client';

import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Slack, 
  FolderSync, 
  Settings as SettingsIcon, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  Eye, 
  EyeOff, 
  Trash2,
  HelpCircle
} from 'lucide-react';
import { 
  saveOpenAIKey, 
  saveSlackConfig, 
  connectMockGoogleDrive, 
  disconnectIntegration,
  getIntegrations
} from './actions';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [slackToken, setSlackToken] = useState('');
  const [slackTeam, setSlackTeam] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [driveConnected, setDriveConnected] = useState(false);
  const [slackConnected, setSlackConnected] = useState(false);

  // Fetch actual database connection statuses on mount
  useEffect(() => {
    async function loadStatuses() {
      const res = await getIntegrations();
      if (res.success) {
        setDriveConnected(res.googleDrive);
        setSlackConnected(res.slack);
      }
    }
    loadStatuses();
  }, []);

  const handleSaveOpenAIKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;
    setLoading(true);
    setMessage(null);
    
    const res = await saveOpenAIKey(apiKey);
    setLoading(false);
    if (res.success) {
      setApiKeySaved(true);
      setApiKey('');
      setMessage({ type: 'success', text: 'OpenAI API Key encrypted and saved successfully.' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to save key' });
    }
  };

  const handleSaveSlack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slackToken || !slackTeam) return;
    setLoading(true);
    setMessage(null);

    const res = await saveSlackConfig(slackToken, slackTeam);
    setLoading(false);
    if (res.success) {
      setSlackConnected(true);
      setSlackToken('');
      setSlackTeam('');
      setMessage({ type: 'success', text: 'Slack workspace integration configured.' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to configure Slack' });
    }
  };

  const handleConnectDrive = async () => {
    setLoading(true);
    const res = await connectMockGoogleDrive();
    setLoading(false);
    if (res.success) {
      setDriveConnected(true);
      setMessage({ type: 'success', text: 'Google Drive sync connection initialized.' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to connect' });
    }
  };

  const handleDisconnect = async (provider: string) => {
    if (!confirm(`Are you sure you want to disconnect ${provider}?`)) return;
    setLoading(true);
    const res = await disconnectIntegration(provider);
    setLoading(false);
    if (res.success) {
      if (provider === 'google-drive') setDriveConnected(false);
      if (provider === 'slack') setSlackConnected(false);
      setMessage({ type: 'success', text: `Successfully disconnected ${provider}.` });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to disconnect' });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-12">
      {/* Header section with page path / breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f1f23] pb-6">
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Configuration</div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            System Preferences
          </h1>
        </div>
      </div>

      {/* Message Box */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'success' ? 'bg-indigo-500/5 border-indigo-500/10 text-indigo-400' : 'bg-red-500/5 border-red-500/10 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="text-xs font-semibold">{message.text}</span>
        </div>
      )}

      {/* OpenAI Settings Card */}
      <div className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">OpenAI API Key</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Encrypts and decrypts key values dynamically on-demand.</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full font-mono uppercase tracking-wider">
            <Lock className="w-3 h-3 text-indigo-400" />
            <span>AES-256-GCM</span>
          </div>
        </div>

        <form onSubmit={handleSaveOpenAIKey} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">API Key Token</label>
            <div className="relative flex items-center">
              <input
                type={showApiKey ? 'text' : 'password'}
                placeholder={apiKeySaved ? '••••••••••••••••••••••••••••••••' : 'sk-proj-...'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={loading}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2.5 pl-3.5 pr-10 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold text-[10px] uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all border border-indigo-500/20"
          >
            {loading ? 'Saving...' : 'Save API Key'}
          </button>
        </form>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Google Drive Card */}
        <div className="glass-card rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-850 text-green-400">
                  <FolderSync className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Google Drive</h2>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Automated document poller</p>
                </div>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                driveConnected ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-zinc-950 text-zinc-600 border-zinc-850'
              }`}>
                {driveConnected ? 'Synced' : 'Inactive'}
              </span>
            </div>
            
            <p className="text-xs text-zinc-500 leading-relaxed">
              Indices shared folders and parses new PDFs, media audio tracks, and text files. Updates the main dashboard feed instantly.
            </p>
          </div>

          <div className="pt-2">
            {driveConnected ? (
              <button
                type="button"
                onClick={() => handleDisconnect('google-drive')}
                className="w-full flex items-center justify-center gap-2 border border-zinc-850 hover:bg-red-500/5 hover:border-red-500/10 text-zinc-500 hover:text-red-400 font-semibold text-[10px] uppercase tracking-wider py-2.5 rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Disconnect Drive
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnectDrive}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-[10px] uppercase tracking-wider py-2.5 rounded-lg border border-zinc-800 transition-colors"
              >
                Connect Google Drive
              </button>
            )}
          </div>
        </div>

        {/* Slack Card */}
        <div className="glass-card rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-850 text-pink-400">
                  <Slack className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Slack Bot</h2>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Assistant workspace listener</p>
                </div>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                slackConnected ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-zinc-950 text-zinc-600 border-zinc-850'
              }`}>
                {slackConnected ? 'Connected' : 'Inactive'}
              </span>
            </div>

            {slackConnected ? (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Workspace listeners active. Ask the bot directly in your workspace:
                </p>
                <div className="bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 font-mono text-[10px] text-zinc-400 flex items-center justify-between">
                  <span>@memory Find Q3 hooks</span>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-600" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveSlack} className="space-y-3 pt-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Bot Token</label>
                  <input
                    type="password"
                    placeholder="xoxb-..."
                    value={slackToken}
                    onChange={(e) => setSlackToken(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Team Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Agency"
                    value={slackTeam}
                    onChange={(e) => setSlackTeam(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider py-2 rounded-lg transition-colors border border-indigo-500/20"
                >
                  Configure Slack
                </button>
              </form>
            )}
          </div>

          {slackConnected && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleDisconnect('slack')}
                className="w-full flex items-center justify-center gap-2 border border-zinc-850 hover:bg-red-500/5 hover:border-red-500/10 text-zinc-500 hover:text-red-400 font-semibold text-[10px] uppercase tracking-wider py-2.5 rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Disconnect Slack
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
