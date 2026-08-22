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
    <div className="w-full max-w-2xl flex flex-col items-center justify-center my-auto z-10 px-2">
      {/* Dynamic Status Header Banner (Proportionate, no overlap) */}
      <div className="h-10 flex items-center justify-center mb-3">
        {isSequenceDisplaying && !isInputPhase && (
          <div className="font-orbitron font-black text-amber-300 text-xs md:text-sm tracking-wider flex items-center gap-2 bg-slate-900/90 px-5 py-1.5 rounded-full border border-amber-400/50 backdrop-blur-md shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>{activeColor ? 'MEMORIZE SEQUENCE!' : 'GET READY...'}</span>
          </div>
        )}

        {isInputPhase && (
          <div className="font-orbitron font-black text-emerald-400 text-xs md:text-sm tracking-wider flex items-center gap-2 bg-slate-900/90 px-5 py-1.5 rounded-full border border-emerald-400/50 backdrop-blur-md shadow-[0_0_20px_rgba(52,211,153,0.3)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>YOUR TURN! PRESS BUTTONS</span>
          </div>
        )}
      </div>

      {/* Main Single-Row Color Console */}
      <div className="relative w-full flex items-center justify-center">
        <GameOverlays
          activeCountdown={activeCountdown}
          roundCountdown={roundCountdown}
          matchWinner={matchWinner}
          currentUserId={currentUserId}
          players={players}
          roundWinner={roundWinner}
        />

        <div className="grid grid-cols-4 gap-3.5 sm:gap-5 md:gap-6 p-4 sm:p-5 md:p-6 bg-white/95 backdrop-blur-xl rounded-[2.5rem] border-4 border-purple-300/40 shadow-2xl relative">
          <ColorPad color={COLOR.RED} activeColor={activeColor} showInputArea={showInputArea} isSpectator={isSpectator} onClick={handleColorClick} />
          <ColorPad color={COLOR.GREEN} activeColor={activeColor} showInputArea={showInputArea} isSpectator={isSpectator} onClick={handleColorClick} />
          <ColorPad color={COLOR.BLUE} activeColor={activeColor} showInputArea={showInputArea} isSpectator={isSpectator} onClick={handleColorClick} />
          <ColorPad color={COLOR.YELLOW} activeColor={activeColor} showInputArea={showInputArea} isSpectator={isSpectator} onClick={handleColorClick} />
        </div>
      </div>
    </div>
  );
}
