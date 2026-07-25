'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLOR } from '@/constants/game';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, CheckCircle2, XCircle } from 'lucide-react';
import type { GameSession } from '@/hooks/useGameEngine';

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
  p1LiveInputs?: string[];
  p2LiveInputs?: string[];
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
  p1LiveInputs = [],
  p2LiveInputs = [],
  currentUserId,
  onReady,
  onSubmitSequence,
}: GameScreenProps) {
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [playerInput, setPlayerInput] = useState<string[]>([]);
  const [roundCountdown, setRoundCountdown] = useState<number | null>(null);
  const [isLocalInputPhase, setIsLocalInputPhase] = useState(false);
  const players = session?.players ?? [];

  const me = players.find(p => p.id === currentUserId);
  const isSpectator = !me;
  
  const effectiveSequence = sequence.length > 0 ? sequence : (session?.currentSequence || []);
  const showInputArea = isInputPhase || isLocalInputPhase || p1LiveInputs.length > 0 || p2LiveInputs.length > 0;

  // Round countdown effect when roundWinner appears
  useEffect(() => {
    if (roundWinner && !matchWinner) {
      const timer = setTimeout(() => {
        setRoundCountdown(3);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [roundWinner, matchWinner]);

  useEffect(() => {
    if (roundCountdown === null) return;

    if (roundCountdown > 0) {
      const timer = setTimeout(() => {
        setRoundCountdown(roundCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setRoundCountdown(null);
    }
  }, [roundCountdown]);

  // Sequence Animation Effect matching ESP32 ON/OFF pulse timing
  useEffect(() => {
    if (effectiveSequence.length > 0 && !isInputPhase && roundCountdown === null) {
      setIsLocalInputPhase(false);
      let step = 0;
      const speed = displaySpeedMs > 0 ? displaySpeedMs : 600;
      const pulseOnDuration = Math.floor(speed * 0.65);

      const runStep = () => {
        if (step < effectiveSequence.length) {
          const color = effectiveSequence[step];
          setActiveColor(color);
          setActiveStep(step + 1);

          setTimeout(() => {
            setActiveColor(null);
          }, pulseOnDuration);

          step++;
        } else {
          setActiveColor(null);
          setActiveStep(null);
          clearInterval(interval);
          setIsLocalInputPhase(true);
        }
      };

      runStep();
      const interval = setInterval(runStep, speed);

      return () => {
        clearInterval(interval);
        setActiveColor(null);
        setActiveStep(null);
      };
    } else {
      setActiveColor(null);
      setActiveStep(null);
    }
  }, [effectiveSequence, displaySpeedMs, isInputPhase, roundCountdown]);

  // Handle Input Phase reset
  useEffect(() => {
    if (isInputPhase) {
      setPlayerInput([]);
    }
  }, [isInputPhase]);

  const handleColorClick = (color: string) => {
    if (!showInputArea || isSpectator) return;
    
    const newInput = [...playerInput, color];
    setPlayerInput(newInput);
    
    // Auto submit when length matches
    if (newInput.length === effectiveSequence.length) {
      onSubmitSequence(newInput);
    }
  };

  if (!session || !session.players) {
    return <div className="text-center p-8 text-white font-orbitron">Waiting for session data...</div>;
  }

  const renderColorPad = (color: string) => {
    const isActive = activeColor === color && !showInputArea;
    const baseColorClass = COLOR_MAP[color as keyof typeof COLOR_MAP];
    const ringColorClass = COLOR_RING[color as keyof typeof COLOR_RING];
    
    return (
      <motion.button
        whileHover={showInputArea ? { scale: 1.05 } : {}}
        whileTap={showInputArea ? { scale: 0.95 } : {}}
        onClick={() => handleColorClick(color)}
        disabled={!showInputArea || isSpectator}
        className={cn(
          "w-32 h-32 md:w-40 md:h-40 rounded-3xl transition-all duration-150 cursor-default",
          baseColorClass,
          isActive 
            ? `opacity-100 scale-110 shadow-[0_0_50px_rgba(255,255,255,0.8)] ring-4 ring-offset-4 ring-offset-slate-900 ${ringColorClass}` 
            : "opacity-30 shadow-sm",
          showInputArea && !isSpectator ? "cursor-pointer hover:opacity-90 active:opacity-100 opacity-70 shadow-lg" : ""
        )}
      />
    );
  };

  const activeCountdown = roundCountdown ?? countdown;

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-4xl mx-auto flex-1 min-h-0 py-1">
      
      {/* Best of 3 Badge */}
      <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
        <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 text-slate-950 font-black font-orbitron text-xs md:text-sm tracking-wider shadow-lg border border-amber-300/50 flex items-center gap-1.5">
          <Trophy className="w-4 h-4 fill-slate-950" />
          <span>BEST OF 3 MATCH</span>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-black font-orbitron text-xs md:text-sm tracking-wider border border-white/30">
          MODE: {session.difficulty || 'MEDIUM'}
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-cyan-300 font-black font-orbitron text-xs md:text-sm tracking-wider border border-cyan-400/30">
          ROUND {session.currentRound || 1} / 3
        </div>
      </div>

      {/* Top Bar: Players & Scores */}
      <div className="flex flex-col md:flex-row justify-between w-full px-4 gap-4">
        {players.map((player, idx) => {
          const isMe = player.id === currentUserId;
          const playerNum = idx + 1;
          const liveInputs = playerNum === 1 ? p1LiveInputs : p2LiveInputs;

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
                  <AvatarFallback className="bg-purple-100 text-purple-800 font-black font-orbitron">
                    {player.displayName.substring(0,2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-orbitron font-black text-lg md:text-xl text-slate-900 truncate">
                      {player.displayName} {isMe && <span className="text-cyan-600 text-xs font-bold">(You)</span>}
                    </span>
                    <span className={cn(
                      "text-[10px] font-black font-orbitron px-2 py-0.5 rounded-full border",
                      playerNum === 1 ? "bg-cyan-100 text-cyan-800 border-cyan-300" : "bg-orange-100 text-orange-800 border-orange-300"
                    )}>
                      P{playerNum}
                    </span>
                  </div>
                  
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
                    
                    {/* Live Progress Dots inside Card */}
                    {showInputArea && (
                      <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200">
                        {Array.from({ length: effectiveSequence.length }).map((_, i) => (
                          <motion.div
                            key={i}
                            animate={liveInputs[i] ? { scale: [1, 1.3, 1] } : {}}
                            className={cn(
                              "w-5 h-5 rounded-full border transition-all duration-200",
                              liveInputs[i] ? COLOR_MAP[liveInputs[i] as keyof typeof COLOR_MAP] : "border-slate-300 bg-white"
                            )}
                          />
                        ))}
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
        
        {/* Sequence Status Text */}
        {!isInputPhase && activeStep && (
          <div className="absolute -top-10 font-orbitron font-black text-amber-300 text-sm md:text-base tracking-wider animate-pulse flex items-center gap-2 bg-slate-900/80 px-5 py-1.5 rounded-full border border-amber-400/40 backdrop-blur-md shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            SHOWING SEQUENCE ({activeStep}/{effectiveSequence.length})
          </div>
        )}

        {/* Input Phase Text */}
        {isInputPhase && (
          <div className="absolute -top-10 font-orbitron font-black text-emerald-400 text-sm md:text-base tracking-wider animate-bounce flex items-center gap-2 bg-slate-900/80 px-5 py-1.5 rounded-full border border-emerald-400/40 backdrop-blur-md shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            YOUR TURN! PRESS BUTTONS
          </div>
        )}

        {/* Countdown Overlay (Start & Next Round) */}
        <AnimatePresence>
          {activeCountdown !== null && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md rounded-[3rem]"
            >
              <div className="text-xl font-black font-orbitron text-amber-300 uppercase tracking-widest mb-2">
                {roundCountdown !== null ? 'NEXT ROUND STARTING...' : 'GET READY!'}
              </div>
              <span className="text-9xl font-black font-orbitron text-amber-400 drop-shadow-[0_4px_20px_rgba(251,191,36,0.6)] animate-pulse">
                {activeCountdown === 0 ? 'GO!' : activeCountdown}
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
                {matchWinner === currentUserId ? '🎉 YOU WON THE MATCH! 🎉' : `${players.find((p, idx) => p.id === matchWinner || (idx + 1).toString() === matchWinner)?.displayName || 'Player'} WON!`}
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

        {/* Real-time Side-by-Side Live Inputs for Player 1 & Player 2 */}
        {showInputArea && (
          <div className="flex flex-col md:flex-row gap-4 bg-white/95 p-4 rounded-[2rem] border-4 border-purple-300/50 shadow-2xl items-center">
            {/* Player 1 Live Progress */}
            <div className="flex items-center gap-3 bg-cyan-50/80 px-4 py-2 rounded-2xl border-2 border-cyan-300">
              <span className="font-orbitron font-black text-xs text-cyan-700">P1:</span>
              <div className="flex gap-2">
                {Array.from({ length: effectiveSequence.length }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={p1LiveInputs[i] ? { scale: [1, 1.3, 1] } : {}}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all duration-200 shadow-sm",
                      p1LiveInputs[i] ? COLOR_MAP[p1LiveInputs[i] as keyof typeof COLOR_MAP] : "border-slate-300 bg-white"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="hidden md:block w-px h-8 bg-purple-200" />

            {/* Player 2 Live Progress */}
            <div className="flex items-center gap-3 bg-orange-50/80 px-4 py-2 rounded-2xl border-2 border-orange-300">
              <span className="font-orbitron font-black text-xs text-orange-700">P2:</span>
              <div className="flex gap-2">
                {Array.from({ length: effectiveSequence.length }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={p2LiveInputs[i] ? { scale: [1, 1.3, 1] } : {}}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all duration-200 shadow-sm",
                      p2LiveInputs[i] ? COLOR_MAP[p2LiveInputs[i] as keyof typeof COLOR_MAP] : "border-slate-300 bg-white"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
