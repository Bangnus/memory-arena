'use client';

import { useQuery } from '@tanstack/react-query';
import { History, Calendar, Trophy, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { historyService } from '@/services/history.service';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HistoryPage() {
  const { player } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => historyService.getHistory(1, 20),
  });

  return (
    <main className="h-screen max-h-screen w-screen flex flex-col justify-between bg-gradient-to-br from-sky-400 via-blue-500 to-orange-400 relative overflow-hidden p-4 md:p-6 text-white">
      {/* Floating RMUT Orbs */}
      <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-yellow-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-orange-300/40 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col min-h-0 space-y-4 z-10">
        
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild className="bg-white/10 text-white hover:bg-white/20">
            <Link href="/game">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Game
            </Link>
          </Button>
        </div>

        <Card className="bg-white/95 backdrop-blur-md border-4 border-purple-300/40 shadow-2xl rounded-[2rem] flex-1 flex flex-col min-h-0 overflow-hidden text-slate-900">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-700">
                <History className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black font-orbitron text-purple-900">Match History</CardTitle>
                <CardDescription className="text-xs font-semibold text-purple-600">Recent match results</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex-1 min-h-0 overflow-y-auto">
            
            {isLoading ? (
              <div className="text-center p-8 text-muted-foreground animate-pulse">
                Loading history...
              </div>
            ) : data?.items.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No matches have been played yet.
              </div>
            ) : (
              <div className="space-y-4">
                {data?.items.map((match) => {
                  const isWinner = match.winnerId === player?.id;
                  const iAmInMatch = match.matchPlayers.some(mp => mp.player.id === player?.id);
                  
                  return (
                    <div key={match.id} className="p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-colors flex flex-col md:flex-row gap-4 justify-between items-center">
                      
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        {match.winnerId ? (
                          isWinner ? (
                            <div className="p-2 rounded-full bg-green-500/10 text-green-500"><Trophy className="w-6 h-6"/></div>
                          ) : iAmInMatch ? (
                            <div className="p-2 rounded-full bg-red-500/10 text-red-500"><XCircle className="w-6 h-6"/></div>
                          ) : (
                            <div className="p-2 rounded-full bg-yellow-500/10 text-yellow-500"><Trophy className="w-6 h-6"/></div>
                          )
                        ) : (
                          <div className="p-2 rounded-full bg-gray-500/10 text-gray-500"><XCircle className="w-6 h-6"/></div>
                        )}
                        
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            {match.winner ? (
                              <span className={isWinner ? 'text-green-500' : 'text-foreground'}>
                                {match.winner.displayName} Won
                              </span>
                            ) : 'Draw / Cancelled'}
                            <Badge variant="outline">{match.difficulty}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(match.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm w-full md:w-auto justify-start md:justify-end">
                        <span className="text-muted-foreground">Players:</span>
                        <div className="flex gap-2">
                          {match.matchPlayers.map(mp => (
                            <Badge key={mp.player.id} variant="secondary">
                              {mp.player.displayName}
                            </Badge>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
            
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
