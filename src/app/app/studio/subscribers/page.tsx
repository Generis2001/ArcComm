'use client';

import { useQuery } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users } from 'lucide-react';

export default function StudioSubscribersPage() {
  const { getAccessToken } = usePrivy();

  const { data, isLoading } = useQuery({
    queryKey: ['studio-subscribers'],
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch('/api/studio/subscribers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Subscribers</h2>
        {data && data.length > 0 && (
          <span className="text-sm text-muted-foreground">{data.length} total</span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <Users className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">No subscribers yet.</p>
          <p className="text-sm text-muted-foreground/70">Share your creator page to attract subscribers.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {data.map((sub: {
            id: string;
            status: string;
            currentPeriodEnd: string;
            tier: { name: string };
            user: { walletAddress: string; username?: string };
          }) => (
            <Card key={sub.id}>
              <CardHeader className="pb-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium font-mono">
                    {sub.user.username ?? `${sub.user.walletAddress.slice(0, 6)}…${sub.user.walletAddress.slice(-4)}`}
                  </CardTitle>
                  <Badge variant={sub.status === 'ACTIVE' ? 'success' : 'outline'}>{sub.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <p>Plan: <span className="text-foreground">{sub.tier.name}</span></p>
                <p>Access ends: {new Date(sub.currentPeriodEnd).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
