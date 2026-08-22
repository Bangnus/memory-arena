'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { gameService } from '@/services/game.service';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function MobileLoginCard({ code, role }: { code: string; role: number }) {
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
