'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminDashboard() {
  // TODO: Fetch admin data from API

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Admin features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
