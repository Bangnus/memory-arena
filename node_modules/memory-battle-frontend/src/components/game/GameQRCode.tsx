'use client';

import QRCode from 'react-qr-code';
import { Smartphone, Sparkles, Zap } from 'lucide-react';

interface GameQRCodeProps {
  value: string;
  size?: number;
  accentColor?: 'cyan' | 'orange';
}

const theme = {
  cyan: {
    shadow: 'shadow-sky-200/60',
    glow: '0 0 20px rgba(56,189,248,0.3), 0 0 40px rgba(56,189,248,0.15)',
    pill: 'bg-sky-100',
    icon: 'text-sky-500',
    gradient: 'from-sky-200 via-blue-100 to-sky-200',
    sparkle: 'text-sky-400',
    qrFg: '#000000',
    qrBg: '#FFFFFF',
  },
  orange: {
    shadow: 'shadow-orange-200/60',
    glow: '0 0 20px rgba(251,146,60,0.3), 0 0 40px rgba(251,146,60,0.15)',
    pill: 'bg-orange-100',
    icon: 'text-orange-500',
    gradient: 'from-orange-200 via-amber-100 to-orange-200',
    sparkle: 'text-orange-400',
    qrFg: '#000000',
    qrBg: '#FFFFFF',
  },
} as const;

export default function GameQRCode({ value, size = 200, accentColor = 'cyan' }: GameQRCodeProps) {
  const t = theme[accentColor];

  return (
    <div className="flex flex-col items-center gap-4">
      <style>{`
        @keyframes qr-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes qr-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes qr-sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        .qr-bob { animation: qr-bob 3.5s ease-in-out infinite; }
        .qr-glow-bg { animation: qr-glow 2.8s ease-in-out infinite; }
        .qr-sparkle { animation: qr-sparkle 2s ease-in-out infinite; }
        .qr-sparkle-delay { animation: qr-sparkle 2s ease-in-out 0.7s infinite; }
        .qr-sparkle-delay2 { animation: qr-sparkle 2s ease-in-out 1.4s infinite; }
        @media (prefers-reduced-motion: reduce) {
          .qr-bob, .qr-glow-bg, .qr-sparkle, .qr-sparkle-delay, .qr-sparkle-delay2 { animation: none; }
        }
      `}</style>

      <div className="qr-bob relative">
        {/* Soft glow behind */}
        <div
          className={`qr-glow-bg absolute -inset-3 bg-gradient-to-br ${t.gradient} rounded-3xl opacity-60 blur-xl pointer-events-none`}
        />

        {/* Sparkle decorations */}
        <Sparkles className="qr-sparkle absolute -top-5 -right-4 w-5 h-5 pointer-events-none" style={{ color: accentColor === 'cyan' ? '#38bdf8' : '#fb923c' }} />
        <Zap className="qr-sparkle-delay absolute -bottom-4 -left-4 w-4 h-4 pointer-events-none" style={{ color: accentColor === 'cyan' ? '#60a5fa' : '#fbbf24' }} />
        <Sparkles className="qr-sparkle-delay2 absolute -top-4 -left-5 w-3.5 h-3.5 pointer-events-none" style={{ color: accentColor === 'cyan' ? '#7dd3fc' : '#fdba74' }} />

        {/* Main container */}
        <div
          className={`relative bg-white/95 backdrop-blur-sm rounded-3xl p-5 ${t.shadow}`}
          style={{ boxShadow: t.glow }}
        >
          {/* QR Code */}
          <div className="rounded-2xl p-2 relative z-10" style={{ backgroundColor: '#FFFFFF' }}>
            <QRCode value={value} size={size} level="H" fgColor={t.qrFg} bgColor="#FFFFFF" />
          </div>
        </div>
      </div>

      {/* Scan pill */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${t.pill} backdrop-blur-sm`}>
        <Smartphone className={`w-4 h-4 ${t.icon}`} />
        <span className="text-sm font-semibold text-slate-600 tracking-wide">Scan to join via LINE</span>
      </div>
    </div>
  );
}
