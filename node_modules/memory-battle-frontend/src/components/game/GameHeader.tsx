import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlayerProfile } from '@/hooks/useAuth';
import { Zap, Coins, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameHeaderProps {
  player: PlayerProfile | null;
  className?: string;
}

export function GameHeader({ player, className }: GameHeaderProps) {
  if (!player) return null;

  // Mocked stats for the game UI feel
  const level = Math.max(1, Math.floor(Math.random() * 50)); 
  const xpProgress = Math.floor(Math.random() * 100);
  const coins = Math.floor(Math.random() * 10000);
  const energy = 100;

  return (
    <div className={cn(
      "w-full max-w-4xl mx-auto flex flex-wrap md:flex-nowrap items-center justify-between gap-4 p-4",
      "bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_30px_rgba(0,229,255,0.15)]",
      className
    )}>
      
      {/* Profile Section */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-16 w-16 border-2 border-primary shadow-[0_0_15px_rgba(0,229,255,0.5)]">
            <AvatarImage src={player.pictureUrl || ''} />
            <AvatarFallback>{player.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2 bg-primary text-black text-xs font-bold px-2 py-0.5 rounded-full border border-black">
            LV.{level}
          </div>
        </div>
        
        <div className="flex flex-col">
          <span className="font-orbitron font-bold text-lg">{player.displayName}</span>
          
          {/* XP Bar */}
          <div className="w-32 h-2 bg-black/50 rounded-full mt-1 overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">XP {xpProgress}%</span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex items-center gap-6 ml-auto">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-gold font-orbitron font-bold text-xl drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
            <Coins className="w-5 h-5" />
            {coins.toLocaleString()}
          </div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Coins</span>
        </div>

        <div className="w-px h-10 bg-white/10" />

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-success font-orbitron font-bold text-xl drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
            <Zap className="w-5 h-5" />
            {energy}/100
          </div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Energy</span>
        </div>
      </div>

    </div>
  );
}
