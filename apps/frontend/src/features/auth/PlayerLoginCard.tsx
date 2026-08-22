import { Loader2, CheckCircle2 } from 'lucide-react';
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
  const readyBorder = 'border-green-400 shadow-[0_0_35px_rgba(74,222,128,0.4)]';
  const pendingBorder = isP1 ? 'border-sky-300 shadow-xl' : 'border-orange-300 shadow-xl';
  const titleColor = isReady ? 'text-green-500' : (isP1 ? 'text-sky-500' : 'text-orange-500');

  return (
    <Card className={`relative overflow-hidden border-4 transition-all duration-500 ${isReady ? readyBorder : pendingBorder} bg-white/95 backdrop-blur-xl rounded-[2rem]`}>
      <CardHeader className="text-center pb-2 pt-5">
        <CardTitle className={`text-3xl font-black font-orbitron ${titleColor}`}>
          Player {playerNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center pb-6">
        {isReady ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-3 animate-in zoom-in duration-500">
            {playerData?.pictureUrl ? (
              <img src={playerData.pictureUrl} alt={playerData.displayName || `Player ${playerNumber}`} className="w-20 h-20 rounded-full border-4 border-green-400 shadow-md object-cover" />
            ) : (
              <CheckCircle2 className="h-20 w-20 text-green-500" />
            )}
            <h3 className="text-xl font-bold text-slate-800 font-orbitron">{playerData?.displayName || `Player ${playerNumber}`}</h3>
            <span className="bg-green-500 text-white px-4 py-0.5 rounded-full text-xs font-bold font-orbitron">READY</span>
          </div>
        ) : qrUrl ? (
          <GameQRCode value={qrUrl} size={200} accentColor={accentColor} />
        ) : (
          <Loader2 className={`h-14 w-14 animate-spin my-8 ${isP1 ? 'text-sky-500' : 'text-orange-500'}`} />
        )}
      </CardContent>
    </Card>
  );
}
