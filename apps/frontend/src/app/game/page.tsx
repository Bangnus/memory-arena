'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { GameScreen } from '@/features/game/GameScreen';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function GamePage() {
  const router = useRouter();
  const { player } = useAuth();
  const { socket } = useSocket();
  const {
    isConnected,
    session,
    countdown,
    sequence,
    displaySpeedMs,
    isInputPhase,
    roundWinner,
    matchWinner,
    p1LiveInputs,
    p2LiveInputs,
    sequenceStartAt,
    toggleReady,
    submitSequence
  } = useGameEngine();

  // IoT START button → go home
  useEffect(() => {
    if (!socket) return;
    const handleDeviceStart = () => {
      router.push('/');
    };
    socket.on('device:start', handleDeviceStart);
    return () => { socket.off('device:start', handleDeviceStart); };
  }, [socket, router]);

  // Match finished → auto go home after 5 seconds
  useEffect(() => {
    if (!matchWinner) return;
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);
    return () => clearTimeout(timer);
  }, [matchWinner, router]);

  if (!isConnected) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Connecting to game server...</p>
      </main>
    );
  }

  return (
    <main className="h-screen max-h-screen w-screen flex flex-col items-center justify-between bg-gradient-to-br from-sky-400 via-blue-500 to-orange-400 relative overflow-hidden p-4 text-white">
      {/* Floating RMUT Orbs */}
      <div className="absolute -top-20 -left-20 w-[450px] h-[450px] bg-yellow-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-orange-300/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-2 z-10">
        <h1 className="text-2xl font-black text-amber-300 font-orbitron tracking-wide drop-shadow-md">MEMORY ARENA</h1>
        <Button variant="ghost" asChild className="bg-white/10 text-white hover:bg-white/20">
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
            p1LiveInputs={p1LiveInputs}
            p2LiveInputs={p2LiveInputs}
            currentUserId={player?.id}
            onReady={toggleReady}
            onSubmitSequence={submitSequence}
            sequenceStartAt={sequenceStartAt}
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
