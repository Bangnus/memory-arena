import { Loader2, Check, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GameQRCode from '@/components/game/GameQRCode';

interface PlayerLoginCardProps {
  playerNumber: 1 | 2;
  isReady: boolean;
  playerData?: {
    displayName?: string;
    pictureUrl?: string | null;
  };
  qrUrl?: string;
}

export function PlayerLoginCard({
  playerNumber,
  isReady,
  playerData,
  qrUrl,
}: PlayerLoginCardProps) {
  const isP1 = playerNumber === 1;
  const accentColor = isP1 ? 'cyan' : 'orange';

  // Player-specific styling definitions
  const theme = isP1
    ? {
        titleColor: 'text-sky-500',
        titleGradient: 'from-sky-400 via-blue-500 to-indigo-500',
        cardBorderReady: 'border border-sky-300/60 shadow-[0_15px_40px_rgba(56,189,248,0.22)]',
        cardBorderPending: 'border border-white/80 shadow-2xl shadow-sky-900/10',
        avatarBorder: 'border-2 border-sky-300 shadow-md',
        badgeBg: 'bg-gradient-to-r from-sky-400 to-blue-500',
        glowBg: 'bg-sky-400/10',
        tagBg: 'bg-sky-50 text-sky-600 border border-sky-200/60',
        subtextColor: 'text-sky-600',
        pulseColor: 'bg-sky-400',
      }
    : {
        titleColor: 'text-orange-500',
        titleGradient: 'from-orange-400 via-amber-500 to-yellow-500',
        cardBorderReady: 'border border-orange-300/60 shadow-[0_15px_40px_rgba(251,146,60,0.22)]',
        cardBorderPending: 'border border-white/80 shadow-2xl shadow-orange-900/10',
        avatarBorder: 'border-2 border-orange-300 shadow-md',
        badgeBg: 'bg-gradient-to-r from-orange-400 to-amber-500',
        glowBg: 'bg-orange-400/10',
        tagBg: 'bg-orange-50 text-orange-600 border border-orange-200/60',
        subtextColor: 'text-orange-600',
        pulseColor: 'bg-orange-400',
      };

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-500 ${
        isReady ? theme.cardBorderReady : theme.cardBorderPending
      } bg-white/95 backdrop-blur-2xl rounded-[2.25rem] min-h-[410px] flex flex-col justify-between`}
    >


      <CardHeader className="text-center pb-2 pt-6">
        <div className="flex items-center justify-center gap-2">
          <span
            className={`text-xs font-black font-orbitron px-2.5 py-0.5 rounded-full ${theme.tagBg}`}
          >
            P{playerNumber}
          </span>
          <CardTitle
            className={`text-3xl sm:text-4xl font-black font-orbitron ${theme.titleColor} tracking-tight`}
          >
            Player {playerNumber}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-center pb-8 pt-2">
        {isReady ? (
          <div className="flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-500 w-full py-2">
            {/* Avatar with Glow and Verified Badge */}
            <div className="relative">
              <div
                className={`absolute -inset-2 ${theme.pulseColor} rounded-full blur-md opacity-40 animate-pulse`}
              />
              {playerData?.pictureUrl ? (
                <img
                  src={playerData.pictureUrl}
                  alt={playerData.displayName || `Player ${playerNumber}`}
                  className={`relative w-24 h-24 rounded-full border-4 ${theme.avatarBorder} object-cover bg-white`}
                />
              ) : (
                <div
                  className={`relative w-24 h-24 rounded-full border-4 ${theme.avatarBorder} bg-gradient-to-br ${theme.titleGradient} flex items-center justify-center`}
                >
                  <span className="text-white font-orbitron font-black text-3xl">
                    P{playerNumber}
                  </span>
                </div>
              )}
              {/* Ready Check Badge on avatar corner */}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white animate-in zoom-in duration-300">
                <Check className="w-4 h-4 stroke-[3.5]" />
              </div>
            </div>

            {/* Player Name */}
            <div className="text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="text-2xl font-black text-slate-800 font-orbitron tracking-wide truncate max-w-[240px]">
                  {playerData?.displayName || `Player ${playerNumber}`}
                </h3>
                <Sparkles className={`w-4 h-4 ${theme.subtextColor}`} />
              </div>
              <p className="text-xs font-semibold text-slate-400 font-orbitron">CONNECTED VIA LINE</p>
            </div>

            {/* Ready Status Pill */}
            <div className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300/80 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black font-orbitron text-emerald-600 tracking-wider">
                READY TO BATTLE
              </span>
            </div>
          </div>
        ) : qrUrl ? (
          <div className="py-2">
            <GameQRCode value={qrUrl} size={190} accentColor={accentColor} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <Loader2 className={`h-12 w-12 animate-spin ${theme.titleColor}`} />
            <p className="text-sm font-semibold text-slate-500 font-orbitron animate-pulse">
              Generating QR Code...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

