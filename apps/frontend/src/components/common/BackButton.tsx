import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function BackButton({
  href = '/',
  label = 'BACK',
  className = '',
}: BackButtonProps) {
  return (
    <div className={`absolute top-4 left-4 z-40 ${className}`}>
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-white/30 bg-white/15 backdrop-blur-xl transition-all duration-300 shadow-lg cursor-pointer hover:bg-white/25 hover:scale-105 active:scale-95 text-white font-orbitron font-bold text-xs tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{label}</span>
      </Link>
    </div>
  );
}
