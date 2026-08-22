'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { gameService } from '@/services/game.service';
import { useAuth } from '@/hooks/useAuth';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useSocket } from '@/hooks/useSocket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import GameQRCode from '@/components/game/GameQRCode';

function MobileLoginContent({ code, role }: { code: string, role: number }) {
  const { login } = useAuth();
  const [status, setStatus] = useState<'authenticating' | 'joining' | 'ready' | 'error'>('authenticating');

  const joinSessionMutation = useMutation({
    mutationFn: (playerNumber: number) => gameService.joinPlayer(playerNumber),
    onSuccess: () => {
      setStatus('ready');
      toast.success('Successfully joined the session!');
    },
    onError: (err) => {
      console.error('Failed to join session', err);
      setStatus('error');
      toast.error('Failed to join the game session.');
    }
  });

  const loginMutation = useMutation({
    mutationFn: authService.loginWithLine,
    onSuccess: (data) => {
      login(data.token, data.player);
      setStatus('joining');
      joinSessionMutation.mutate(role);
    },
    onError: (err) => {
      console.error(err);
      setStatus('error');
      toast.error('Failed to login with LINE.');
    },
  });

  useEffect(() => {
    if (code) {
      const redirectUri = process.env.NEXT_PUBLIC_LINE_CALLBACK_URL || (typeof window !== 'undefined' ? `${window.location.origin}/login` : '');
      loginMutation.mutate({ code, redirectUri });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border-4 border-blue-300 shadow-2xl rounded-3xl">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-3xl font-bold tracking-tight text-slate-800 font-orbitron">Player {role}</CardTitle>
        <CardDescription className="text-base font-medium">Mobile Authentication</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {status === 'authenticating' && (
          <div className="flex flex-col items-center space-y-4 py-6">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-slate-600 font-medium animate-pulse">Authenticating with LINE...</p>
          </div>
        )}
        {status === 'joining' && (
          <div className="flex flex-col items-center space-y-4 py-6">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
            <p className="text-slate-600 font-medium animate-pulse">Joining game session...</p>
          </div>
        )}
        {status === 'ready' && (
          <div className="flex flex-col items-center space-y-4 py-6 text-center">
            <CheckCircle2 className="h-20 w-20 text-green-500" />
            <h3 className="text-2xl font-bold text-slate-800 font-orbitron">You are Ready!</h3>
            <p className="text-slate-600 font-medium">Please look at the main screen.</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4 py-6 text-center">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-4xl text-red-500">!</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 font-orbitron">Error Occurred</h3>
            <p className="text-slate-600">Please scan the QR code again.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CentralDisplayContent() {
  const router = useRouter();
  const { session } = useGameEngine();
  const { socket } = useSocket();
  const [qrUrls, setQrUrls] = useState<{ p1: string, p2: string } | null>(null);

  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  useEffect(() => {
    gameService.getCurrentSession().catch(console.error);

    const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID || '';
    const redirectUri = process.env.NEXT_PUBLIC_LINE_CALLBACK_URL || 'https://equivocal-unmapped-pecan.ngrok-free.dev/api/v1/auth/line/callback';
    
    if (!clientId) {
      toast.error('LINE Client ID is missing!');
      return;
    }

    const buildUrl = (role: number) => {
      return `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=mobile_role_${role}&scope=profile%20openid`;
    };

    setQrUrls({ p1: buildUrl(1), p2: buildUrl(2) });
  }, []);

  // Listen for game:waiting event from backend (synced with IoT)
  useEffect(() => {
    if (!socket) return;
    const handleGameWaiting = (data: { countdown: number }) => {
      console.log(`[DEBUG][LOGIN][${Date.now()}] game:waiting received: countdown=${data.countdown}`);
      setRedirectCountdown(data.countdown);
    };
    socket.on('game:waiting', handleGameWaiting);
    return () => { socket.off('game:waiting', handleGameWaiting); };
  }, [socket]);

  useEffect(() => {
    if (session?.player1Id && session?.player2Id && redirectCountdown === null) {
      console.log(`[DEBUG][LOGIN][${Date.now()}] Fallback: both players ready, starting countdown=5`);
      setRedirectCountdown(5);
    }
  }, [session, redirectCountdown]);

  useEffect(() => {
    if (redirectCountdown === null) return;

    if (redirectCountdown > 0) {
      console.log(`[DEBUG][LOGIN][${Date.now()}] countdown tick: ${redirectCountdown}`);
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      console.log(`[DEBUG][LOGIN][${Date.now()}] countdown=0, redirecting to /game`);
      window.location.href = '/game';
    }
  }, [redirectCountdown]);

  const p1Ready = !!session?.player1Id;
  const p2Ready = !!session?.player2Id;
  const bothReady = p1Ready && p2Ready;

  // ดึงข้อมูล player จาก session
  const player1 = session?.players?.find(p => p.id === session.player1Id);
  const player2 = session?.players?.find(p => p.id === session.player2Id);

  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-black text-white drop-shadow-lg mb-1.5 font-orbitron tracking-tight">
          Memory Arena
        </h1>
        <p className="text-base sm:text-lg text-white/90 font-medium drop-shadow">
          Scan QR Code to Join the Battle
        </p>
      </div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Player 1 Card */}
        <Card className={`relative overflow-hidden border-4 transition-all duration-500 ${
          p1Ready 
            ? 'border-green-400 shadow-[0_0_35px_rgba(74,222,128,0.4)]' 
            : 'border-sky-300 shadow-xl'
        } bg-white/95 backdrop-blur-xl rounded-[2rem]`}>
          <CardHeader className="text-center pb-2 pt-5">
            <CardTitle className={`text-3xl font-black font-orbitron ${p1Ready ? 'text-green-500' : 'text-sky-500'}`}>
              Player 1
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-6">
            {p1Ready ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-3 animate-in zoom-in duration-500">
                {player1?.pictureUrl ? (
                  <img src={player1.pictureUrl} alt={player1.displayName} className="w-20 h-20 rounded-full border-4 border-green-400 shadow-md object-cover" />
                ) : (
                  <CheckCircle2 className="h-20 w-20 text-green-500" />
                )}
                <h3 className="text-xl font-bold text-slate-800 font-orbitron">{player1?.displayName || 'Player 1'}</h3>
                <span className="bg-green-500 text-white px-4 py-0.5 rounded-full text-xs font-bold font-orbitron">READY</span>
              </div>
            ) : qrUrls?.p1 ? (
              <GameQRCode value={qrUrls.p1} size={200} accentColor="cyan" />
            ) : (
              <Loader2 className="h-14 w-14 animate-spin text-sky-500 my-8" />
            )}
          </CardContent>
        </Card>

        {/* Player 2 Card */}
        <Card className={`relative overflow-hidden border-4 transition-all duration-500 ${
          p2Ready 
            ? 'border-green-400 shadow-[0_0_35px_rgba(74,222,128,0.4)]' 
            : 'border-orange-300 shadow-xl'
        } bg-white/95 backdrop-blur-xl rounded-[2rem]`}>
          <CardHeader className="text-center pb-2 pt-5">
            <CardTitle className={`text-3xl font-black font-orbitron ${p2Ready ? 'text-green-500' : 'text-orange-500'}`}>
              Player 2
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-6">
            {p2Ready ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-3 animate-in zoom-in duration-500">
                {player2?.pictureUrl ? (
                  <img src={player2.pictureUrl} alt={player2.displayName} className="w-20 h-20 rounded-full border-4 border-green-400 shadow-md object-cover" />
                ) : (
                  <CheckCircle2 className="h-20 w-20 text-green-500" />
                )}
                <h3 className="text-xl font-bold text-slate-800 font-orbitron">{player2?.displayName || 'Player 2'}</h3>
                <span className="bg-green-500 text-white px-4 py-0.5 rounded-full text-xs font-bold font-orbitron">READY</span>
              </div>
            ) : qrUrls?.p2 ? (
              <GameQRCode value={qrUrls.p2} size={200} accentColor="orange" />
            ) : (
              <Loader2 className="h-14 w-14 animate-spin text-orange-500 my-8" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Both Ready Countdown & Action Link */}
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

function LoginRouting() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const router = useRouter();

  useEffect(() => {
    if (error) {
      toast.error(`Login error: ${error}`);
      router.replace('/login');
    }
  }, [error, router]);

  // Determine if this is a mobile callback
  const isMobileLogin = state?.startsWith('mobile_role_');
  const role = isMobileLogin && state ? parseInt(state.split('_')[2]) : null;

  if (code && isMobileLogin && role) {
    return <MobileLoginContent code={code} role={role} />;
  }

  return <CentralDisplayContent />;
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-sky-400 via-blue-500 to-orange-400 relative overflow-hidden py-8 px-4">
      {/* Background Elements */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-orange-300/40 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="z-10 w-full flex justify-center">
        <Suspense fallback={
          <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-white" />
          </div>
        }>
          <LoginRouting />
        </Suspense>
      </div>
    </main>
  );
}
