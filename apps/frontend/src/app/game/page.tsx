'use client';

import { useGameEngine } from '@/hooks/useGameEngine';
import { useAuth } from '@/hooks/useAuth';
import { GameScreen } from '@/features/game/GameScreen';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function GamePage() {
  const { player } = useAuth();
  const {
    isConnected,
    session,
    countdown,
    sequence,
    displaySpeedMs,
    isInputPhase,
    roundWinner,
    matchWinner,
    toggleReady,
    submitSequence
  } = useGameEngine();

  if (!isConnected) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Connecting to game server...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-background to-background/50 relative overflow-hidden p-4">
      {/* Top Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-8 z-10">
        <h1 className="text-2xl font-black text-primary tracking-tight">MEMORY ARENA</h1>
        <Button variant="ghost" asChild>
          <Link href="/history">Match History</Link>
        </Button>
      </div>

      <div className="flex-1 w-full flex items-center justify-center z-10">
        {session ? (
          <GameScreen 
            session={session}
            countdown={countdown}
            sequence={sequence}
            displaySpeedMs={displaySpeedMs}
            isInputPhase={isInputPhase}
            roundWinner={roundWinner}
            matchWinner={matchWinner}
            currentUserId={player?.id}
            onReady={toggleReady}
            onSubmitSequence={submitSequence}
          />
        ) : (
          <div className="text-xl text-muted-foreground">
            Waiting for a game session...
          </div>
        )}
      </div>
    </main>
  );
}
