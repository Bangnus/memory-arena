'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaderboardTable } from '@/features/leaderboard/LeaderboardTable';

export default function LeaderboardPage() {
  return (
    <main className="h-screen max-h-screen w-screen flex flex-col justify-between bg-gradient-to-br from-sky-400 via-blue-500 to-orange-400 relative overflow-hidden p-4 md:p-6 text-white">
      {/* Floating RMUT Orbs */}
      <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-yellow-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-orange-300/40 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col min-h-0 space-y-4 z-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild className="bg-white/10 text-white hover:bg-white/20">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="flex-1 min-h-0">
          <LeaderboardTable />
        </div>
      </div>
    </main>
  );
}
