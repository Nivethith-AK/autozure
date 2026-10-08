'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  GitFork,
  Activity,
  KeyRound,
  Settings,
  Layers,
  ChevronRight,
  LogOut,
  Radio,
  Server,
  Zap,
} from 'lucide-react';
import { authApi } from '@/lib/api';

const NAV_ITEMS = [
  { label: 'Workflows', href: '/', icon: GitFork },
  { label: 'Executions', href: '/executions', icon: Activity },
  { label: 'Credentials', href: '/settings', icon: KeyRound },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('flowforge_token');
      localStorage.removeItem('flowforge_refresh_token');
      window.location.href = '/login';
    }
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="h-14 border-b border-slate-800 px-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 border border-emerald-400/40 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-950/50">
              <Zap className="h-4 w-4 fill-slate-950" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-slate-100">FlowForge</span>
              <span className="block text-[10px] text-emerald-400 font-mono">Self-Hosted</span>
            </div>
          </Link>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            v1.0
          </span>
        </div>

        {/* Workspace Selector Bar */}
        <div className="p-3 border-b border-slate-800/60">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-2.5 flex items-center justify-between hover:border-slate-700 cursor-pointer transition-colors">
            <div className="overflow-hidden">
              <span className="block text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Workspace</span>
              <span className="block text-xs font-semibold text-slate-200 truncate">Default Workspace</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            // Prevent duplicate highlight for credentials & settings which share pathname
            const isActive =
              item.label === 'Workflows'
                ? pathname === '/'
                : item.label === 'Executions'
                ? pathname.startsWith('/executions')
                : item.label === 'Credentials'
                ? pathname.startsWith('/settings') && idx === 2
                : pathname.startsWith('/settings') && idx === 3;

            return (
              <Link
                key={`${item.label}-${idx}`}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Engine Status & Logout */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        {/* Engine status indicator */}
        <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-emerald-400" />
            Engine
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
