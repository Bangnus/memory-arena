'use client';

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { gameService } from '@/services/game.service';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useSocket } from '@/hooks/useSocket';
import { PlayerLoginCard } from './PlayerLoginCard';
import { toast } from 'sonner';

export function CentralLoginDisplay() {
  const { session } = useGameEngine();
  const { socket } = useSocket();
  const [qrUrls, setQrUrls] = useState<{ p1: string; p2: string } | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  useEffect(() => {
    gameService.getCurrentSession().catch(console.error);

    const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID || '';
    const redirectUri = process.env.NEXT_PUBLIC_LINE_CALLBACK_URL || 'https://equivocal-unmapped-pecan.ngrok-free.dev/api/v1/auth/line/callback';
    
    if (!clientId) {
      toast.error('LINE Client ID is missing!');
      return;
    }

    const buildUrl = (role: number) => `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=mobile_role_${role}&scope=profile%20openid`;
    setQrUrls({ p1: buildUrl(1), p2: buildUrl(2) });
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleGameWaiting = (data: { countdown: number }) => setRedirectCountdown(data.countdown);
    socket.on('game:waiting', handleGameWaiting);
    return () => { socket.off('game:waiting', handleGameWaiting); };
  }, [socket]);

  useEffect(() => {
    if (session?.player1Id && session?.player2Id && redirectCountdown === null) {
      setRedirectCountdown(5);
    }
  }, [session, redirectCountdown]);

  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown > 0) {
      const timer = setTimeout(() => setRedirectCountdown(redirectCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    window.location.href = '/game';
  }, [redirectCountdown]);

  const p1Ready = !!session?.player1Id;
  const p2Ready = !!session?.player2Id;
  const bothReady = p1Ready && p2Ready;
  const player1 = session?.players?.find(p => p.id === session.player1Id);
  const player2 = session?.players?.find(p => p.id === session.player2Id);

  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      <div className="text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-black text-white drop-shadow-lg mb-1.5 font-orbitron tracking-tight">Memory Arena</h1>
        <p className="text-base sm:text-lg text-white/90 font-medium drop-shadow">Scan QR Code to Join the Battle</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <PlayerLoginCard playerNumber={1} isReady={p1Ready} playerData={player1} qrUrl={qrUrls?.p1} />
        <PlayerLoginCard playerNumber={2} isReady={p2Ready} playerData={player2} qrUrl={qrUrls?.p2} />
      </div>

      {bothReady && (
        <div className="mt-6 text-center animate-in slide-in-from-bottom-6 duration-500 flex flex-col items-center space-y-3">
          <div className="inline-flex items-center px-8 py-3 bg-white/25 backdrop-blur-xl rounded-full border-2 border-white/50 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-orbitron font-black text-2xl mr-3.5 shadow-md animate-bounce">
              {redirectCountdown === 0 ? 'GO!' : redirectCountdown}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-black font-orbitron text-white tracking-wide uppercase">
                {redirectCountdown === 0 ? 'STARTING MATCH!' : `MATCH STARTING IN ${redirectCountdown}S`}
              </span>
              <span className="text-xs font-semibold text-white/90">Both players ready! Look at the display screen</span>
            </div>
          </div>
          
          <button 
            onClick={() => window.location.href = '/game'}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white/95 hover:bg-white text-blue-600 hover:text-blue-700 font-bold rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer text-xs font-orbitron"
          >
            <span>Click here to enter game immediately</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
