'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLOR } from '@/constants/game';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, CheckCircle2, XCircle } from 'lucide-react';
import type { GameSession, PlayerState } from '@/hooks/useGameEngine';

const COLOR_MAP = {
  [COLOR.RED]: 'bg-red-500 shadow-red-500/50',
  [COLOR.GREEN]: 'bg-green-500 shadow-green-500/50',
  [COLOR.BLUE]: 'bg-blue-500 shadow-blue-500/50',
  [COLOR.YELLOW]: 'bg-yellow-400 shadow-yellow-500/50',
};

const COLOR_RING = {
  [COLOR.RED]: 'ring-red-500',
  [COLOR.GREEN]: 'ring-green-500',
  [COLOR.BLUE]: 'ring-blue-500',
  [COLOR.YELLOW]: 'ring-yellow-400',
};

interface GameScreenProps {
  session: GameSession | null;
  countdown: number | null;
  sequence: string[];
  displaySpeedMs: number;
  isInputPhase: boolean;
  roundWinner: string | null;
  matchWinner: string | null;
  currentUserId: string | undefined;
  onReady: () => void;
  onSubmitSequence: (seq: string[]) => void;
}

export function GameScreen({
  session,
  countdown,
  sequence,
  displaySpeedMs,
  isInputPhase,
  roundWinner,
  matchWinner,
  currentUserId,
  onReady,
  onSubmitSequence,
}: GameScreenProps) {
  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null);
  const [playerInput, setPlayerInput] = useState<string[]>([]);
  const isSpectator = !session?.players.find(p => p.id === currentUserId);
  const me = session?.players.find(p => p.id === currentUserId);
  
  // Sequence Animation Effect
  useEffect(() => {
    if (sequence.length > 0 && !isInputPhase) {
      let index = 0;
      setActiveColorIndex(index);
      
      const interval = setInterval(() => {
        index++;
        if (index < sequence.length) {
          setActiveColorIndex(index);
        } else {
          setActiveColorIndex(null);
          clearInterval(interval);
        }
      }, displaySpeedMs);

      return () => clearInterval(interval);
    } else {
      setActiveColorIndex(null);
    }
  }, [sequence, displaySpeedMs, isInputPhase]);

  // Handle Input Phase reset
  useEffect(() => {
    if (isInputPhase) {
      setPlayerInput([]);
    }
  }, [isInputPhase]);

  const handleColorClick = (color: string) => {
    if (!isInputPhase || isSpectator) return;
    
    const newInput = [...playerInput, color];
    setPlayerInput(newInput);
    
    // Auto submit when length matches
    if (newInput.length === sequence.length) {
      onSubmitSequence(newInput);
    }
  };

  if (!session) {
    return <div className="text-center p-8">Waiting for session data...</div>;
  }

  const renderColorPad = (color: string) => {
    const isActive = sequence[activeColorIndex ?? -1] === color && !isInputPhase;
    const baseColorClass = COLOR_MAP[color as keyof typeof COLOR_MAP];
    const ringColorClass = COLOR_RING[color as keyof typeof COLOR_RING];
    
    return (
      <motion.button
        whileHover={isInputPhase ? { scale: 1.05 } : {}}
        whileTap={isInputPhase ? { scale: 0.95 } : {}}
        onClick={() => handleColorClick(color)}
        disabled={!isInputPhase || isSpectator}
        className={cn(
          "w-32 h-32 md:w-40 md:h-40 rounded-3xl transition-all duration-200 cursor-default",
          baseColorClass,
          isActive ? `opacity-100 scale-110 shadow-2xl ring-4 ring-offset-4 ring-offset-background ${ringColorClass}` : "opacity-40 shadow-sm",
          isInputPhase && !isSpectator ? "cursor-pointer hover:opacity-80 active:opacity-100 opacity-60 shadow-lg" : ""
        )}
      />
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto space-y-8">
      
      {/* Top Bar: Players & Scores */}
      <div className="flex justify-between w-full px-4 gap-8">
        {session.players.map((player) => {
          const isMe = player.id === currentUserId;
          return (
            <Card key={player.id} className={cn(
              "flex-1 bg-background/50 backdrop-blur-md border-primary/20",
              isMe ? "ring-2 ring-primary" : ""
            )}>
              <div className="p-4 flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/50">
                  <AvatarImage src={player.pictureUrl || ''} />
                  <AvatarFallback>{player.displayName.substring(0,2)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-bold text-lg">{player.displayName} {isMe && "(You)"}</span>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-2xl font-black text-primary">{player.score}</span>
                  </div>
                  {session.status === 'WAITING' && (
                    <span className={cn("text-xs font-bold mt-1", player.isReady ? "text-green-500" : "text-muted-foreground")}>
                      {player.isReady ? 'READY' : 'NOT READY'}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Center Game Area */}
      <div className="relative w-full aspect-square max-w-[600px] flex items-center justify-center">
        
        {/* Countdown Overlay */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-3xl"
            >
              <span className="text-9xl font-black text-primary drop-shadow-[0_0_30px_rgba(16,185,129,0.8)]">
                {countdown === 0 ? 'GO!' : countdown}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Match Winner Overlay */}
        <AnimatePresence>
          {matchWinner && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md rounded-3xl border-2 border-primary"
            >
              <Trophy className="w-24 h-24 text-yellow-500 mb-4 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
              <h2 className="text-4xl font-black mb-2">MATCH FINISHED</h2>
              <p className="text-xl">
                {matchWinner === currentUserId ? 'YOU WON!' : `${session.players.find(p=>p.id === matchWinner)?.displayName} WON!`}
              </p>
              <Button onClick={() => window.location.reload()} className="mt-8" size="lg">Play Again</Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Round Result Toast-like overlay */}
        <AnimatePresence>
          {roundWinner && !matchWinner && (
             <motion.div 
             initial={{ y: -50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: -50, opacity: 0 }}
             className="absolute top-4 z-40 px-8 py-4 bg-card rounded-full shadow-2xl border border-primary/30 flex items-center gap-3"
           >
             {roundWinner === currentUserId ? (
               <><CheckCircle2 className="text-green-500 w-8 h-8" /><span className="text-xl font-bold">You won the round!</span></>
             ) : (
               <><XCircle className="text-red-500 w-8 h-8" /><span className="text-xl font-bold">You lost the round!</span></>
             )}
           </motion.div>
          )}
        </AnimatePresence>

        {/* Game Pads */}
        <div className="grid grid-cols-2 gap-4 md:gap-8 p-8 bg-card/30 rounded-3xl border border-white/5 shadow-2xl">
          {renderColorPad(COLOR.RED)}
          {renderColorPad(COLOR.GREEN)}
          {renderColorPad(COLOR.YELLOW)}
          {renderColorPad(COLOR.BLUE)}
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="h-24 flex items-center justify-center w-full">
        {session.status === 'WAITING' && !isSpectator && (
          <Button 
            size="lg" 
            onClick={onReady}
            variant={me?.isReady ? 'outline' : 'default'}
            className="text-xl h-16 px-12 rounded-full font-bold shadow-xl"
          >
            {me?.isReady ? 'Cancel Ready' : 'I am Ready!'}
          </Button>
        )}

        {isInputPhase && !isSpectator && (
          <div className="flex gap-2">
            {Array.from({ length: sequence.length }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-8 h-8 rounded-full border-2",
                  playerInput[i] ? COLOR_MAP[playerInput[i] as keyof typeof COLOR_MAP] : "border-muted-foreground/30"
                )}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
