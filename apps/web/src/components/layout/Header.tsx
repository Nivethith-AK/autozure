'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Moon, Sun, Search, User, ShieldCheck, LogOut, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  return (
    <header className="h-14 border-b border-border bg-[#08090d]/90 backdrop-blur-md px-6 flex items-center justify-between select-none z-20">
      {/* Search Input */}
      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search workflows, triggers..."
            className="pl-9 h-9 bg-card border-border text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Dark / Light Toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleTheme}
          className="rounded-xl text-slate-400 hover:text-white"
          title="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <div className="h-4 w-px bg-border" />

        {/* User Info with shadcn DropdownMenu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-card transition-colors outline-none focus-visible:ring-1 focus-visible:ring-emerald-500">
              <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 border border-emerald-400/40 flex items-center justify-center text-xs font-black text-slate-950 shadow-sm">
                A
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-xs font-semibold text-slate-200">admin@flowforge.local</span>
                <span className="block text-[10px] text-muted-foreground font-mono">Production Cluster</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#0e111a] border-border text-slate-200">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-bold leading-none text-white">Administrator</p>
                <p className="text-[11px] leading-none text-muted-foreground font-mono">admin@flowforge.local</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4 text-emerald-400" />
                <span>Account & Vault</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings?tab=system" className="flex items-center gap-2 cursor-pointer">
                <ShieldCheck className="h-4 w-4 text-sky-400" />
                <span>Cluster Security</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                localStorage.removeItem('flowforge_token');
                localStorage.removeItem('flowforge_refresh_token');
                window.location.href = '/login';
              }}
              className="text-rose-400 focus:text-rose-300 flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
