'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLOR } from '@/constants/game';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, CheckCircle2, XCircle } from 'lucide-react';
import { useSound } from '@/hooks/useSound';
import type { GameSession } from '@/hooks/useGameEngine';

const COLOR_MAP = {
  [COLOR.RED]: 'bg-red-500 shadow-red-500/50',
  [COLOR.BLUE]: 'bg-blue-500 shadow-blue-500/50',
};

interface GameScreenProps {
  session: GameSession | null;
  countdown: number | null;
  sequence: string[];
  displaySpeedMs?: number;
  isInputPhase: boolean;
  isSequenceDisplaying: boolean;
  roundWinner: string | null;
  matchWinner: string | null;
  p1LiveInputs?: string[];
  p2LiveInputs?: string[];
  currentUserId: string | undefined;
  onReady: () => void;
  onSubmitSequence: (seq: string[]) => void;
  sequenceStartAt?: number | null;
  sequenceId?: number;
}

export function GameScreen({
  session,
  countdown,
  sequence,
  displaySpeedMs = 800,
  isInputPhase,
  isSequenceDisplaying,
  roundWinner,
  matchWinner,
  p1LiveInputs = [],
  p2LiveInputs = [],
  currentUserId,
  onReady,
  onSubmitSequence,
  sequenceStartAt,
  sequenceId = 0,
}: GameScreenProps) {
  const [playerInput, setPlayerInput] = useState<string[]>([]);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [roundCountdown, setRoundCountdown] = useState<number | null>(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const seqAnimRef = useRef(0);
  const players = session?.players ?? [];
  const { playButtonPress, playCorrect, playWrong } = useSound();

  // Round countdown effect when roundWinner appears
  useEffect(() => {
    if (roundWinner && !matchWinner) {
      // Play correct/wrong sound based on result
      if (roundWinner === currentUserId) {
        playCorrect();
      } else {
        playWrong();
      }
      const timer = setTimeout(() => {
        setRoundCountdown(3);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [roundWinner, matchWinner, currentUserId, playCorrect, playWrong]);

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

  // Sequence animation - sync with IoT via sequenceStartAt
  useEffect(() => {
    if (sequence.length === 0 || !sequenceStartAt || isInputPhase || sequenceId === 0) {
      setActiveColor(null);
      return;
    }

    const gen = ++seqAnimRef.current;

    const startDelay = sequenceStartAt - Date.now();
    const timer = setTimeout(() => {
      if (gen !== seqAnimRef.current) return;

      let i = 0;
      const showNext = () => {
        if (gen !== seqAnimRef.current || i >= sequence.length) {
          setActiveColor(null);
          return;
        }
        setActiveColor(sequence[i]);
        i++;
        setTimeout(showNext, displaySpeedMs);
      };
      showNext();
    }, Math.max(0, startDelay));

    return () => {
      clearTimeout(timer);
      seqAnimRef.current++;
      setActiveColor(null);
    };
  }, [sequenceId, sequence, sequenceStartAt, isInputPhase, displaySpeedMs]);

  // Clear active color when input phase starts
  useEffect(() => {
    if (isInputPhase) {
      setActiveColor(null);
    }
  }, [isInputPhase]);

  const me = players.find(p => p.id === currentUserId);
  const isSpectator = !me;
  
  const effectiveSequence = sequence.length > 0 ? sequence : (session?.currentSequence || []);
  const showInputArea = isInputPhase || p1LiveInputs.length > 0 || p2LiveInputs.length > 0;

  // Handle Input Phase reset
  useEffect(() => {
    if (isInputPhase) {
      setPlayerInput([]);
    }
  }, [isInputPhase]);

  const handleColorClick = (color: string) => {
    if (!showInputArea || isSpectator) return;
    
    // Debounce: ignore if less than 200ms since last click
    const now = Date.now();
    if (now - lastClickTime < 200) return;
    setLastClickTime(now);
    
    playButtonPress();
    
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
    const baseColorClass = COLOR_MAP[color as keyof typeof COLOR_MAP];
    const isActive = activeColor === color;
    
    return (
      <motion.button
        whileHover={showInputArea ? { scale: 1.05 } : {}}
        whileTap={showInputArea ? { scale: 0.95 } : {}}
        onClick={() => handleColorClick(color)}
        disabled={!showInputArea || isSpectator}
        className={cn(
          "w-32 h-32 md:w-40 md:h-40 rounded-3xl transition-all duration-100 cursor-default",
          baseColorClass,
          isActive
            ? "opacity-100 shadow-2xl scale-110 ring-4 ring-white/60"
            : showInputArea && !isSpectator
              ? "opacity-70 shadow-lg cursor-pointer hover:opacity-90 active:opacity-100"
              : "opacity-30 shadow-sm",
        )}
      />
    );
  };

  const activeCountdown = roundCountdown ?? countdown;

  const player1 = players[0];
  const player2 = players[1];

  return (
    <div className="w-full h-full flex flex-col justify-between items-center relative overflow-hidden py-1 px-4 select-none">
      
      {/* Top Bar: Corner Player Cards & Center Badges */}
      <div className="w-full max-w-6xl flex items-start justify-between gap-4 z-10">
        
        {/* Top Left Corner: Player 1 Card */}
        {player1 ? (
          <div className={cn(
            "w-60 md:w-72 relative overflow-hidden rounded-3xl border-3 bg-white/95 backdrop-blur-xl p-3 shadow-xl transition-all duration-300 text-slate-900",
            player1.id === currentUserId ? "border-cyan-400 bg-cyan-50/40 ring-4 ring-cyan-300/30" : "border-cyan-200"
          )}>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 md:h-14 md:w-14 border-3 border-cyan-400 shadow-md">
                <AvatarImage src={player1.pictureUrl || ''} />
                <AvatarFallback className="bg-cyan-100 text-cyan-800 font-black font-orbitron">P1</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-orbitron font-black text-sm md:text-base text-slate-900 truncate">
                    {player1.displayName}
                  </span>
                  <span className="text-[10px] font-black font-orbitron px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300">P1</span>
                </div>
                <div className="flex justify-between items-end mt-0.5">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span className="text-xl md:text-2xl font-black text-purple-700 font-orbitron">{player1.score}</span>
                  </div>
                  {/* Live progress dots inside P1 card */}
                  {showInputArea && (
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-full border border-slate-200">
                      {Array.from({ length: effectiveSequence.length }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={p1LiveInputs[i] ? { scale: [1, 1.3, 1] } : {}}
                          className={cn("w-4 h-4 rounded-full border transition-all duration-200", p1LiveInputs[i] ? COLOR_MAP[p1LiveInputs[i] as keyof typeof COLOR_MAP] : "border-slate-300 bg-white")}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : <div className="w-60 md:w-72" />}

        {/* Top Center: Match Status Badges */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <div className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 text-slate-950 font-black font-orbitron text-xs tracking-wider shadow-md border border-amber-300/50 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 fill-slate-950" />
            <span>BEST OF 3</span>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white font-black font-orbitron text-[11px] border border-white/30">
              MODE: {session.difficulty || 'MEDIUM'}
            </div>
            <div className="px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-cyan-300 font-black font-orbitron text-[11px] border border-cyan-400/30">
              ROUND {Math.min(3, session.currentRound || ((players[0]?.score || 0) + (players[1]?.score || 0) + 1))} / 3
            </div>
          </div>
        </div>

        {/* Top Right Corner: Player 2 Card */}
        {player2 ? (
          <div className={cn(
            "w-60 md:w-72 relative overflow-hidden rounded-3xl border-3 bg-white/95 backdrop-blur-xl p-3 shadow-xl transition-all duration-300 text-slate-900",
            player2.id === currentUserId ? "border-orange-400 bg-orange-50/40 ring-4 ring-orange-300/30" : "border-orange-200"
          )}>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 md:h-14 md:w-14 border-3 border-orange-400 shadow-md">
                <AvatarImage src={player2.pictureUrl || ''} />
                <AvatarFallback className="bg-orange-100 text-orange-800 font-black font-orbitron">P2</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-orbitron font-black text-sm md:text-base text-slate-900 truncate">
                    {player2.displayName}
                  </span>
                  <span className="text-[10px] font-black font-orbitron px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-300">P2</span>
                </div>
                <div className="flex justify-between items-end mt-0.5">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span className="text-xl md:text-2xl font-black text-purple-700 font-orbitron">{player2.score}</span>
                  </div>
                  {/* Live progress dots inside P2 card */}
                  {showInputArea && (
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-full border border-slate-200">
                      {Array.from({ length: effectiveSequence.length }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={p2LiveInputs[i] ? { scale: [1, 1.3, 1] } : {}}
                          className={cn("w-4 h-4 rounded-full border transition-all duration-200", p2LiveInputs[i] ? COLOR_MAP[p2LiveInputs[i] as keyof typeof COLOR_MAP] : "border-slate-300 bg-white")}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : <div className="w-60 md:w-72" />}
      </div>

      {/* Center Game Arena Pads */}
      <div className="relative w-full aspect-square max-w-[340px] md:max-w-[380px] flex items-center justify-center my-auto z-10">
        
        {/* Sequence Status Text */}
        {isSequenceDisplaying && !isInputPhase && (
          <div className="absolute -top-9 font-orbitron font-black text-amber-300 text-xs md:text-sm tracking-wider animate-pulse flex items-center gap-2 bg-slate-900/80 px-4 py-1 rounded-full border border-amber-400/40 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            {activeColor ? 'MEMORIZE!' : 'GET READY...'}
          </div>
        )}

        {/* Input Phase Text */}
        {isInputPhase && (
          <div className="absolute -top-9 font-orbitron font-black text-emerald-400 text-xs md:text-sm tracking-wider animate-bounce flex items-center gap-2 bg-slate-900/80 px-4 py-1 rounded-full border border-emerald-400/40 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
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
              <div className="text-lg font-black font-orbitron text-amber-300 uppercase tracking-widest mb-1">
                {roundCountdown !== null ? 'NEXT ROUND STARTING...' : 'GET READY!'}
              </div>
              <span className="text-8xl font-black font-orbitron text-amber-400 drop-shadow-[0_4px_20px_rgba(251,191,36,0.6)] animate-pulse">
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
              <div className="w-20 h-20 bg-amber-400 text-amber-950 rounded-3xl flex items-center justify-center mb-3 shadow-xl border-4 border-amber-300 transform -rotate-3">
                <Trophy className="w-12 h-12 fill-amber-950" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black font-orbitron mb-1 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
                MATCH FINISHED
              </h2>
              <p className="text-xl font-bold font-inter mb-5 text-purple-900">
                {matchWinner === currentUserId ? '🎉 YOU WON THE MATCH! 🎉' : `${players.find((p, idx) => p.id === matchWinner || (idx + 1).toString() === matchWinner)?.displayName || 'Player'} WON!`}
              </p>
              <Button onClick={() => window.location.href = '/'} size="lg" className="h-14 px-8 text-lg font-orbitron font-black rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-slate-950 shadow-lg hover:scale-105">
                RETURN TO HOME
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
             className="absolute top-2 z-40 px-6 py-2 bg-white text-slate-900 rounded-full shadow-xl border-3 border-purple-300 flex items-center gap-2"
           >
             {roundWinner === currentUserId ? (
               <><CheckCircle2 className="text-emerald-500 w-6 h-6" /><span className="text-lg font-black text-emerald-600 font-orbitron tracking-wide">ROUND WON!</span></>
             ) : (
               <><XCircle className="text-rose-500 w-6 h-6" /><span className="text-lg font-black text-rose-600 font-orbitron tracking-wide">ROUND LOST!</span></>
             )}
           </motion.div>
          )}
        </AnimatePresence>

        {/* Game Pads Container */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 p-6 md:p-8 bg-white/95 backdrop-blur-xl rounded-[3rem] border-4 border-purple-300/40 shadow-2xl relative">
          {renderColorPad(COLOR.RED)}
          {renderColorPad(COLOR.BLUE)}
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="h-16 flex items-center justify-center w-full z-10">
        {session.status === 'WAITING' && !isSpectator && (
          <Button 
            size="lg" 
            onClick={onReady}
            className={cn(
              "text-xl h-14 px-12 rounded-[1.5rem] font-black font-orbitron tracking-wider transition-all duration-300 shadow-xl border-4 border-white/20",
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
          <div className="flex gap-4 bg-white/95 px-5 py-2 rounded-full border-3 border-purple-300/50 shadow-xl items-center">
            {/* Player 1 Live Progress */}
            <div className="flex items-center gap-2 bg-cyan-50/80 px-3 py-1 rounded-xl border border-cyan-300">
              <span className="font-orbitron font-black text-[11px] text-cyan-700">P1:</span>
              <div className="flex gap-1.5">
                {Array.from({ length: effectiveSequence.length }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={p1LiveInputs[i] ? { scale: [1, 1.3, 1] } : {}}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all duration-200 shadow-sm",
                      p1LiveInputs[i] ? COLOR_MAP[p1LiveInputs[i] as keyof typeof COLOR_MAP] : "border-slate-300 bg-white"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="w-px h-6 bg-purple-200" />

            {/* Player 2 Live Progress */}
            <div className="flex items-center gap-2 bg-orange-50/80 px-3 py-1 rounded-xl border border-orange-300">
              <span className="font-orbitron font-black text-[11px] text-orange-700">P2:</span>
              <div className="flex gap-1.5">
                {Array.from({ length: effectiveSequence.length }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={p2LiveInputs[i] ? { scale: [1, 1.3, 1] } : {}}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all duration-200 shadow-sm",
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
