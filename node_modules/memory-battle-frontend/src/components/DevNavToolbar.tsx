'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, Trophy, History, Shield, LogIn, ChevronRight, ChevronLeft, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DevNavToolbar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const links = [
    { href: '/', label: 'Home Page', icon: Home },
    { href: '/login', label: 'LINE Login', icon: LogIn },
    { href: '/game', label: 'Game Arena', icon: Gamepad2 },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/history', label: 'Match History', icon: History },
    { href: '/admin', label: 'Admin Panel', icon: Shield },
  ];

  return (
    <div 
      className={cn(
        "fixed right-3 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 flex items-center gap-1",
        isCollapsed ? "translate-x-[calc(100%-2.5rem)]" : "translate-x-0"
      )}
    >
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-8 h-12 bg-slate-900/90 text-amber-400 hover:text-amber-300 border-2 border-white/20 rounded-l-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl transition-colors cursor-pointer"
        title={isCollapsed ? "Expand Dev Sidebar" : "Collapse Dev Sidebar"}
      >
        {isCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      {/* Sidebar Panel */}
      <div className="bg-slate-900/95 text-white backdrop-blur-2xl border-2 border-white/20 p-3 rounded-2xl shadow-2xl flex flex-col gap-3 min-w-[160px] text-xs font-orbitron">
        
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-amber-400">
          <Wrench className="w-4 h-4 animate-spin-slow" />
          <span className="font-black tracking-wider text-[11px]">DEV SIDEBAR</span>
        </div>

        {/* Route Links */}
        <div className="flex flex-col gap-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 font-bold group",
                  isActive 
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-lg scale-[1.02]" 
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-slate-950" : "text-cyan-400 group-hover:scale-110 transition-transform")} />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer info (Subtle & Small) */}
        <div className="pt-2 border-t border-white/10 text-[9px] text-slate-500 font-mono text-center">
          Created by Nus Peerapat
        </div>

      </div>
    </div>
  );
}
