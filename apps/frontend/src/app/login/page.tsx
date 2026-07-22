'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { MessageCircle, Loader2 } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const loginMutation = useMutation({
    mutationFn: authService.loginWithLine,
    onSuccess: (data) => {
      login(data.accessToken, data.player);
      toast.success(`Welcome, ${data.player.displayName}!`);
      router.push('/game');
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed to login with LINE.');
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(`Login error: ${error}`);
      router.replace('/login');
    } else if (code) {
      const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/login` : '';
      loginMutation.mutate({ code, redirectUri });
    }
  }, [code, error]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLineLogin = () => {
    setIsRedirecting(true);
    const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID || '';
    const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/login` : '';
    const state = Math.random().toString(36).substring(7);
    
    if (!clientId) {
      toast.error('LINE Client ID is missing from environment variables.');
      setIsRedirecting(false);
      return;
    }

    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=profile%20openid`;
    window.location.href = lineAuthUrl;
  };

  return (
    <Card className="w-full max-w-md bg-background/60 backdrop-blur-xl border-primary/20 shadow-2xl">
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-3xl font-bold tracking-tight text-primary">Authentication</CardTitle>
        <CardDescription className="text-lg">Sign in to start playing</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {code || loginMutation.isPending ? (
          <div className="flex flex-col items-center space-y-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium animate-pulse">Authenticating with LINE...</p>
          </div>
        ) : (
          <Button 
            onClick={handleLineLogin} 
            disabled={isRedirecting}
            className="w-full h-14 text-lg font-bold bg-[#06C755] hover:bg-[#05a546] text-white shadow-lg shadow-[#06C755]/30 rounded-full"
          >
            {isRedirecting ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <MessageCircle className="mr-3 h-6 w-6" />
            )}
            Log in with LINE
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-background/50 relative p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />
      <div className="z-10 w-full max-w-md">
        <Suspense fallback={
          <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        }>
          <LoginContent />
        </Suspense>
      </div>
    </main>
  );
}
