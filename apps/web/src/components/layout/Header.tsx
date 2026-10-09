'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Moon, Sun, Search, User } from 'lucide-react';

export function Header() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  return (
    <header className="h-14 border-b border-[#1a1f2e] bg-[#08090d]/90 backdrop-blur-md px-6 flex items-center justify-between select-none">
      {/* Search Input / Quick Guide */}
      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search workflows, triggers..."
            className="w-full rounded-xl bg-[#0e111a] border border-[#1a1f2e] pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2 text-slate-400 hover:bg-[#0e111a] hover:text-slate-100 transition-colors"
          title="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="h-4 w-px bg-[#1a1f2e]" />

        {/* User Info */}
        <Link
          href="/settings"
          className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#0e111a] transition-colors"
        >
          <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 border border-emerald-400/40 flex items-center justify-center text-xs font-black text-slate-950 shadow-sm">
            A
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-semibold text-slate-200">admin@flowforge.local</span>
            <span className="block text-[10px] text-slate-500 font-mono">Production Cluster</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
