'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GitFork,
  Activity,
  KeyRound,
  Settings,
  Layers,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { authApi } from '@/lib/api';

const NAV_ITEMS = [
  { label: 'Workflows', href: '/', icon: GitFork },
  { label: 'Executions', href: '/executions', icon: Activity },
  { label: 'Credentials', href: '/settings?tab=credentials', icon: KeyRound },
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
        <div className="h-14 border-b border-slate-800 px-5 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-slate-100">FlowForge</span>
            <span className="block text-[10px] text-emerald-400 font-mono">v1.0.0</span>
          </div>
        </div>

        {/* Workspace Selector Bar */}
        <div className="p-3 border-b border-slate-800/60">
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5 flex items-center justify-between hover:border-slate-700 cursor-pointer transition-colors">
            <div className="overflow-hidden">
              <span className="block text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Workspace</span>
              <span className="block text-xs font-medium text-slate-200 truncate">Default Workspace</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
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

      {/* User / Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
