'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ShieldAlert, Download, RefreshCcw, Activity } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminPage() {
  const { isAuthenticated, player } = useAuth();
  const router = useRouter();

  // Basic guard (In real app, check for player.role === 'ADMIN')
  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) {
      const timer = setTimeout(() => {
        if (!localStorage.getItem('token')) {
          router.replace('/login');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

  const { data: health, refetch: refetchHealth } = useQuery({
    queryKey: ['health'],
    queryFn: adminService.getSystemHealth,
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });

  const resetMutation = useMutation({
    mutationFn: adminService.resetSystem,
    onSuccess: () => {
      toast.success('System reset successfully. All active sessions cleared.');
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed to reset system.');
    }
  });

  const exportMutation = useMutation({
    mutationFn: (format: 'json'|'csv') => adminService.exportData(format),
    onSuccess: (data, format) => {
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `memory-arena-export-${Date.now()}.json`;
        a.click();
      } else {
        const url = URL.createObjectURL(data as Blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `memory-arena-export-${Date.now()}.csv`;
        a.click();
      }
      toast.success('Data exported successfully.');
    },
    onError: () => toast.error('Failed to export data')
  });

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4 border-b border-border/50 pb-4">
          <ShieldAlert className="w-10 h-10 text-destructive" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage game system and monitor health</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5"/> System Health</CardTitle>
              <CardDescription>Real-time backend metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={health?.status === 'OK' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                  {health?.status || 'Loading...'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database</span>
                <span className={health?.database === 'UP' ? 'text-green-500' : 'text-red-500'}>
                  {health?.database || 'Loading...'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-mono">{health?.uptimeSeconds ? `${health.uptimeSeconds}s` : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Memory (Heap)</span>
                <span className="font-mono">{health?.memory?.heapUsedMb ? `${health.memory.heapUsedMb} MB` : '-'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible system actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <RefreshCcw className="w-4 h-4 mr-2" /> Reset Game System
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action will delete all active game sessions, match history, and rounds.
                      Player profiles will remain intact. This cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="destructive" onClick={() => resetMutation.mutate()} disabled={resetMutation.isPending}>
                      {resetMutation.isPending ? 'Resetting...' : 'Yes, Reset System'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="flex gap-2">
                <Button variant="outline" className="w-full" onClick={() => exportMutation.mutate('json')} disabled={exportMutation.isPending}>
                  <Download className="w-4 h-4 mr-2" /> Export JSON
                </Button>
                <Button variant="outline" className="w-full" onClick={() => exportMutation.mutate('csv')} disabled={exportMutation.isPending}>
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              </div>
              
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  );
}
