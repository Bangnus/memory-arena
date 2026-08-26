'use client';

import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Zap, Gamepad2, Flame, Award } from 'lucide-react';
import { leaderboardService } from '@/services/leaderboard.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function LeaderboardTable() {
  const { data: players = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => leaderboardService.getTopPlayers(10),
    refetchInterval: 10000,
  });

  return (
    <Card className="bg-white/95 backdrop-blur-xl border-4 border-purple-300/40 shadow-2xl rounded-[2.5rem] h-full flex flex-col overflow-hidden text-slate-900">
      <CardHeader className="text-center pb-4 pt-6 border-b border-purple-100 bg-gradient-to-b from-purple-50/80 to-transparent">
        <div className="w-14 h-14 mx-auto bg-amber-400 text-amber-950 rounded-2xl flex items-center justify-center mb-2 shadow-lg transform -rotate-3 border-2 border-amber-300">
          <Trophy className="w-8 h-8 fill-amber-950" />
        </div>
        <CardTitle className="text-3xl font-black tracking-tight font-orbitron bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
          GLOBAL LEADERBOARD
        </CardTitle>
        <CardDescription className="text-sm font-semibold text-purple-600/80">
          Top Arena Champions & Points 👑
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 md:px-5 pr-2 md:pr-3">
        <div className="flex flex-col gap-2.5 pr-1">
          {players.length === 0 ? (
            <div className="text-center py-10 text-purple-600 font-semibold bg-purple-50/60 rounded-2xl border-2 border-dashed border-purple-200">
              {isLoading ? 'Loading leaderboard...' : 'No data available'}
            </div>
          ) : (
            players.map((entry, idx) => {
              const isTop = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;
              
              return (
                <div 
                  key={entry.playerId || idx} 
                  className={cn(
                    "flex items-center gap-3 p-3 md:p-3.5 rounded-2xl transition-all duration-300 border-2",
                    isTop 
                      ? "bg-gradient-to-r from-amber-100 via-amber-50 to-white border-amber-400 shadow-md scale-[1.01]" 
                      : isSecond 
                      ? "bg-slate-50 border-slate-300 shadow-sm"
                      : isThird
                      ? "bg-amber-50/60 border-amber-200 shadow-sm"
                      : "bg-white border-slate-100 hover:border-purple-200"
                  )}
                >
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-orbitron font-black text-lg md:text-xl shadow-inner">
                    {isTop ? (
                      <span className="w-full h-full bg-amber-400 text-amber-950 rounded-xl flex items-center justify-center border border-amber-300 font-black text-xl">
                        🥇
                      </span>
                    ) : isSecond ? (
                      <span className="w-full h-full bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center border border-slate-300 font-black text-xl">
                        🥈
                      </span>
                    ) : isThird ? (
                      <span className="w-full h-full bg-amber-200 text-amber-900 rounded-xl flex items-center justify-center border border-amber-300 font-black text-xl">
                        🥉
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold">#{idx + 1}</span>
                    )}
                  </div>
                  
                  {/* Avatar */}
                  <Avatar className={cn(
                    "h-10 w-10 md:h-11 md:w-11 border-2 shadow-sm flex-shrink-0",
                    isTop ? "border-amber-400" : "border-purple-200"
                  )}>
                    <AvatarImage src={entry.pictureUrl || ''} />
                    <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">
                      {entry.displayName ? entry.displayName.substring(0, 2).toUpperCase() : 'PL'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Player Name & Play Stats */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={cn(
                        "font-black truncate text-sm md:text-base",
                        isTop ? "text-amber-950" : "text-slate-800"
                      )}>
                        {entry.displayName}
                      </span>
                      {isTop && (
                        <span className="inline-block bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full font-orbitron">
                          Champion
                        </span>
                      )}
                    </div>
                    
                    {/* Matches Played & Win Rate */}
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] font-semibold flex-wrap">
                      <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        <Gamepad2 className="w-3 h-3 text-indigo-500" />
                        <span>{entry.games} {entry.games === 1 ? 'Match' : 'Matches'}</span>
                      </span>
                      {entry.games > 0 && (
                        <span className="text-emerald-600 font-mono text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                          {entry.winRate}% Win
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Score & Wins Stats */}
                  <div className="flex flex-col items-end justify-center gap-0.5 flex-shrink-0">
                    <div className={cn(
                      "font-orbitron font-black text-base md:text-lg flex items-center gap-1",
                      isTop ? "text-amber-600" : "text-purple-700"
                    )}>
                      <Zap className={cn("w-4 h-4", isTop ? "fill-amber-500 text-amber-500" : "fill-purple-500 text-purple-500")} />
                      <span>{(entry.score ?? 0).toLocaleString()}</span>
                      <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">PTS</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Award className="w-3 h-3 text-purple-400" />
                      <span className="text-purple-600 font-extrabold">{entry.wins}</span>
                      <span className="text-[10px] uppercase text-slate-400 font-semibold">{entry.wins === 1 ? 'Win' : 'Wins'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
