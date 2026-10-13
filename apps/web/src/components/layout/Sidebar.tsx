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
  Server,
  Zap,
  Blocks,
  ShieldCheck,
} from 'lucide-react';
import { authApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { label: 'Workflows', href: '/', icon: GitFork, badge: null },
  { label: 'Executions', href: '/executions', icon: Activity, badge: 'Live', badgeVariant: 'info' as const },
  { label: 'Plugins & Connectors', href: '/plugins', icon: Blocks, badge: '93', badgeVariant: 'default' as const },
  { label: 'Credentials Vault', href: '/settings?tab=credentials', icon: KeyRound, badge: 'AES-256', badgeVariant: 'purple' as const },
  { label: 'System & Engine', href: '/settings?tab=system', icon: Settings, badge: null },
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
    <aside className="w-64 border-r border-border bg-zinc-950 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="h-14 border-b border-border px-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white font-black shadow-sm group-hover:border-white transition-colors">
              <Zap className="h-4 w-4 fill-white text-white" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
                FlowForge
              </span>
              <span className="block text-[10px] text-zinc-400 font-mono">Self-Hosted Enterprise</span>
            </div>
          </Link>

          <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0 border-border bg-zinc-900 text-zinc-300">
            v1.0
          </Badge>
        </div>

        {/* Workspace Selector Bar */}
        <div className="p-3 border-b border-border/60">
          <div className="rounded-xl bg-zinc-900/60 border border-border p-2.5 flex items-center justify-between hover:border-zinc-700 cursor-pointer transition-colors group">
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="block text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                  Workspace
                </span>
              </div>
              <span className="block text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors truncate mt-0.5">
                Production Cluster
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : item.href === '/executions'
                ? pathname.startsWith('/executions')
                : item.href === '/plugins'
                ? pathname.startsWith('/plugins')
                : item.href.startsWith('/settings')
                ? pathname.startsWith('/settings')
                : false;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all ${
                  isActive
                    ? 'bg-white text-zinc-950 font-bold border border-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <Badge
                    variant={isActive ? 'default' : 'secondary'}
                    className={`text-[9px] font-mono px-1.5 py-0 font-semibold ${
                      isActive ? 'bg-zinc-900 text-zinc-100 border-zinc-800' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Engine Status & Logout */}
      <div className="p-3 border-t border-border space-y-2">
        {/* Engine status indicator */}
        <div className="px-3 py-2 rounded-xl bg-zinc-900/60 border border-border flex items-center justify-between text-[11px] font-mono">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-zinc-300" />
            Local Node Engine
          </span>
          <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            93 Nodes
          </span>
        </div>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 h-auto"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
