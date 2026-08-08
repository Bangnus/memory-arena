import { ColorPad } from './ColorPad';
import { GameOverlays } from './GameOverlays';
import { COLOR } from '@/constants/game';
import type { PlayerState } from '@/hooks/useGameEngine';

interface GameArenaProps {
  isSequenceDisplaying: boolean;
  isInputPhase: boolean;
  activeColor: string | null;
  activeCountdown: number | null;
  roundCountdown: number | null;
  matchWinner: string | null;
  currentUserId: string | undefined;
  players: PlayerState[];
  roundWinner: string | null;
  showInputArea: boolean;
  isSpectator: boolean;
  handleColorClick: (color: string) => void;
}

export function GameArena({
  isSequenceDisplaying,
  isInputPhase,
  activeColor,
  activeCountdown,
  roundCountdown,
  matchWinner,
  currentUserId,
  players,
  roundWinner,
  showInputArea,
  isSpectator,
  handleColorClick,
}: GameArenaProps) {
  return (
    <div className="relative w-full aspect-square max-w-[340px] md:max-w-[380px] flex items-center justify-center my-auto z-10">
      {isSequenceDisplaying && !isInputPhase && (
        <div className="absolute -top-9 font-orbitron font-black text-amber-300 text-xs md:text-sm tracking-wider animate-pulse flex items-center gap-2 bg-slate-900/80 px-4 py-1 rounded-full border border-amber-400/40 backdrop-blur-md shadow-lg">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          {activeColor ? 'MEMORIZE!' : 'GET READY...'}
        </div>
      )}

      {isInputPhase && (
        <div className="absolute -top-9 font-orbitron font-black text-emerald-400 text-xs md:text-sm tracking-wider animate-bounce flex items-center gap-2 bg-slate-900/80 px-4 py-1 rounded-full border border-emerald-400/40 backdrop-blur-md shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          YOUR TURN! PRESS BUTTONS
        </div>
      )}

      <GameOverlays
        activeCountdown={activeCountdown}
        roundCountdown={roundCountdown}
        matchWinner={matchWinner}
        currentUserId={currentUserId}
        players={players}
        roundWinner={roundWinner}
      />

      <div className="grid grid-cols-2 gap-4 md:gap-6 p-6 md:p-8 bg-white/95 backdrop-blur-xl rounded-[3rem] border-4 border-purple-300/40 shadow-2xl relative">
        <ColorPad color={COLOR.RED} activeColor={activeColor} showInputArea={showInputArea} isSpectator={isSpectator} onClick={handleColorClick} />
        <ColorPad color={COLOR.BLUE} activeColor={activeColor} showInputArea={showInputArea} isSpectator={isSpectator} onClick={handleColorClick} />
      </div>
    </div>
  );
}
