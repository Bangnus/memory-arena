'use client';

import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Timer, Hash } from 'lucide-react';
import { leaderboardService } from '@/services/leaderboard.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function LeaderboardTable() {
  const { data: players = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => leaderboardService.getTopPlayers(10),
    refetchInterval: 10000,
  });

  return (
    <Card className="bg-background/60 backdrop-blur-md border-primary/20 shadow-2xl h-full flex flex-col">
      <CardHeader className="text-center pb-6 border-b border-border/50">
        <Trophy className="w-12 h-12 mx-auto text-yellow-500 mb-3 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
        <CardTitle className="text-3xl font-extrabold tracking-tight text-primary">Global Leaderboard</CardTitle>
        <CardDescription className="text-md">Top players worldwide</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 flex-1 overflow-y-auto max-h-[600px]">
        <div className="rounded-md border border-border/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-12 text-center"><Hash className="w-4 h-4 mx-auto"/></TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-center">Wins</TableHead>
                <TableHead className="text-right"><Timer className="w-4 h-4 ml-auto inline mr-1"/> Best Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell>Loading...</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                ))
              ) : players.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No players found. Be the first to play!
                  </TableCell>
                </TableRow>
              ) : (
                players.map((entry, idx) => (
                  <TableRow key={entry.id} className="transition-colors hover:bg-muted/50">
                    <TableCell className="text-center font-bold">
                      {idx === 0 ? <Medal className="w-6 h-6 text-yellow-500 mx-auto" /> :
                       idx === 1 ? <Medal className="w-6 h-6 text-gray-400 mx-auto" /> :
                       idx === 2 ? <Medal className="w-6 h-6 text-amber-600 mx-auto" /> :
                       `#${idx + 1}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-primary/20">
                          <AvatarImage src={entry.player.pictureUrl || ''} />
                          <AvatarFallback>{entry.player.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-foreground text-sm truncate max-w-[120px] sm:max-w-[150px]">{entry.player.displayName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-sm px-2 py-0.5 font-bold">
                        {entry.score}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono font-medium text-primary text-sm">
                        {entry.bestTimeMs > 0 ? `${(entry.bestTimeMs / 1000).toFixed(3)}s` : '-'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
