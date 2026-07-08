'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Search, Database, Settings as SettingsIcon, BrainCircuit } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/search', label: 'AI Search', icon: Search },
    { href: '/knowledge', label: 'Knowledge Base', icon: Database },
    { href: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 border-r border-[#1f1f23] bg-[#09090b]/80 backdrop-blur-md flex flex-col justify-between shrink-0">
      <div className="flex flex-col">
        {/* Header / Logo */}
        <div className="h-16 px-6 border-b border-[#1f1f23] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <BrainCircuit className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">Memory AI</span>
          <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full font-medium">MVP</span>
        </div>

        {/* Nav Links */}
        <nav className="p-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-white shadow-[0_0_15px_rgba(99,102,241,0.05)]' 
                    : 'border border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info */}
      <div className="p-4 border-t border-[#1f1f23] flex items-center gap-3 bg-[#070709]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-semibold text-white shadow-md shadow-indigo-500/20">
          AC
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-xs font-medium text-white truncate">Agency Client</span>
          <span className="text-[10px] text-zinc-500 truncate">agency@contentmemory.ai</span>
        </div>
      </div>
    </aside>
  );
}
