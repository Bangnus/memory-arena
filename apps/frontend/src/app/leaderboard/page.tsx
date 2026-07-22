'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaderboardTable } from '@/features/leaderboard/LeaderboardTable';

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="h-[800px]">
          <LeaderboardTable />
        </div>
      </div>
    </main>
  );
}
