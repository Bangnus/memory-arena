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
  [COLOR.BLUE]: 'bg-blue-500 shadow-blue-500/50',
};

const COLOR_RING = {
  [COLOR.RED]: 'ring-red-500',
  [COLOR.BLUE]: 'ring-blue-500',
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
  const players = session?.players ?? [];

  const me = players.find(p => p.id === currentUserId);
  const isSpectator = !me;
  
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

  if (!session || !session.players) {
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
    <div className="flex flex-col items-center justify-between w-full max-w-4xl mx-auto flex-1 min-h-0 py-1">
      
      {/* Top Bar: Players & Scores */}
      <div className="flex flex-col md:flex-row justify-between w-full px-4 gap-4">
        {players.map((player) => {
          const isMe = player.id === currentUserId;
          return (
            <div key={player.id} className={cn(
              "flex-1 relative overflow-hidden rounded-[2rem] border-3 bg-white/95 backdrop-blur-xl transition-all duration-300 text-slate-900 shadow-xl",
              isMe ? "border-cyan-400 bg-cyan-50/40 ring-4 ring-cyan-300/30" : "border-purple-200"
            )}>
              <div className="p-4 md:p-5 flex items-center gap-4 relative z-10">
                <Avatar className={cn(
                  "h-16 w-16 md:h-18 md:w-18 border-4 shadow-md",
                  isMe ? "border-cyan-400" : "border-purple-200"
                )}>
                  <AvatarImage src={player.pictureUrl || ''} />
                  <AvatarFallback className="bg-purple-100 text-purple-800 font-black">
                    {player.displayName.substring(0,2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col flex-1">
                  <span className="font-orbitron font-black text-lg md:text-xl text-slate-900 truncate">
                    {player.displayName} {isMe && <span className="text-cyan-600 text-xs font-bold">(You)</span>}
                  </span>
                  
                  <div className="flex justify-between items-end mt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider font-orbitron">Wins</span>
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
                        <span className="text-3xl font-black text-purple-700 font-orbitron">
                          {player.score}
                        </span>
                      </div>
                    </div>
                    
                    {session.status === 'WAITING' && (
                      <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-black font-orbitron border-2 shadow-sm",
                        player.isReady 
                          ? "bg-emerald-400 text-emerald-950 border-emerald-300" 
                          : "bg-slate-100 border-slate-200 text-slate-500"
                      )}>
                        {player.isReady ? 'READY' : 'WAITING'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Center Game Area */}
      <div className="relative w-full aspect-square max-w-[400px] md:max-w-[440px] flex items-center justify-center my-auto">
        
        {/* Countdown Overlay */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md rounded-[3rem]"
            >
              <span className="text-9xl font-black font-orbitron text-amber-400 drop-shadow-[0_4px_20px_rgba(251,191,36,0.6)]">
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
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl rounded-[3rem] border-4 border-amber-400 shadow-2xl p-6 text-center text-slate-900"
            >
              <div className="w-24 h-24 bg-amber-400 text-amber-950 rounded-3xl flex items-center justify-center mb-4 shadow-xl border-4 border-amber-300 transform -rotate-3">
                <Trophy className="w-14 h-14 fill-amber-950" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black font-orbitron mb-2 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
                MATCH FINISHED
              </h2>
              <p className="text-2xl font-bold font-inter mb-6 text-purple-900">
                {matchWinner === currentUserId ? '🎉 YOU WON THE MATCH! 🎉' : `${players.find(p=>p.id === matchWinner)?.displayName || 'Player'} WON!`}
              </p>
              <Button onClick={() => window.location.reload()} size="lg" className="h-16 px-10 text-xl font-orbitron font-black rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 shadow-lg hover:scale-105">
                PLAY AGAIN
              </Button>
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
             className="absolute top-4 z-40 px-8 py-3 bg-white text-slate-900 rounded-full shadow-xl border-4 border-purple-300 flex items-center gap-3"
           >
             {roundWinner === currentUserId ? (
               <><CheckCircle2 className="text-emerald-500 w-8 h-8" /><span className="text-xl font-black text-emerald-600 font-orbitron tracking-wide">ROUND WON!</span></>
             ) : (
               <><XCircle className="text-rose-500 w-8 h-8" /><span className="text-xl font-black text-rose-600 font-orbitron tracking-wide">ROUND LOST!</span></>
             )}
           </motion.div>
          )}
        </AnimatePresence>

        {/* Game Pads Container */}
        <div className="grid grid-cols-2 gap-5 md:gap-8 p-7 md:p-9 bg-white/95 backdrop-blur-xl rounded-[3rem] border-4 border-purple-300/40 shadow-2xl relative">
          {renderColorPad(COLOR.RED)}
          {renderColorPad(COLOR.BLUE)}
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="h-24 flex items-center justify-center w-full mt-2">
        {session.status === 'WAITING' && !isSpectator && (
          <Button 
            size="lg" 
            onClick={onReady}
            className={cn(
              "text-2xl h-20 px-16 rounded-[2rem] font-black font-orbitron tracking-wider transition-all duration-300 shadow-xl border-4 border-white/20",
              me?.isReady 
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/40"
                : "bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-slate-950 hover:scale-105 active:scale-95 shadow-cyan-400/40"
            )}
          >
            {me?.isReady ? 'CANCEL READY' : 'READY TO PLAY!'}
          </Button>
        )}

        {isInputPhase && !isSpectator && (
          <div className="flex gap-3 bg-white/90 p-4 rounded-full border-4 border-purple-300/50 shadow-xl">
            {Array.from({ length: sequence.length }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-10 h-10 rounded-full border-3 transition-all duration-300 shadow-inner",
                  playerInput[i] ? COLOR_MAP[playerInput[i] as keyof typeof COLOR_MAP] : "border-slate-300 bg-slate-100"
                )}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
