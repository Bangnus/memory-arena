'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';
import { MobileLoginCard } from '@/features/auth/MobileLoginCard';
import { CentralLoginDisplay } from '@/features/auth/CentralLoginDisplay';
import { toast } from 'sonner';

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

  const isMobileLogin = state?.startsWith('mobile_role_');
  const role = isMobileLogin && state ? parseInt(state.split('_')[2]) : null;

  if (code && isMobileLogin && role) {
    return <MobileLoginCard code={code} role={role} />;
  }

  return <CentralLoginDisplay />;
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-sky-400 via-blue-500 to-orange-400 relative overflow-hidden py-8 px-4">
      {/* Top Left Back Button */}
      <div className="absolute top-4 left-4 z-40">
        <Link
          href="/mode"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-white/30 bg-white/15 backdrop-blur-xl transition-all duration-300 shadow-lg cursor-pointer hover:bg-white/25 hover:scale-105 active:scale-95 text-white font-orbitron font-bold text-xs tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK</span>
        </Link>
      </div>

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
