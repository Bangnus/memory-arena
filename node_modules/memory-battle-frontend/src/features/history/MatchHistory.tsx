'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Match {
  id: string;
  winner: string;
  loser: string;
  difficulty: string;
  rounds: number;
  duration: number;
  createdAt: string;
}

export function MatchHistory() {
  // TODO: Fetch match history from API

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match History</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">No matches yet.</p>
      </CardContent>
    </Card>
  );
}
