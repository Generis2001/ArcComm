'use client';

import { useQuery } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Users, DollarSign, FileText } from 'lucide-react';
import { formatUsdc } from '@/lib/payments/usdc';

export default function StudioAnalyticsPage() {
  const { getAccessToken } = usePrivy();

  const { data, isLoading } = useQuery({
    queryKey: ['studio-analytics'],
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch('/api/studio/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Earned',
      value: data?.totalEarned ? formatUsdc(BigInt(data.totalEarned)) : '—',
      icon: DollarSign,
    },
    {
      label: 'Active Subscribers',
      value: data?.activeSubscribers ?? '—',
      icon: Users,
    },
    {
      label: 'Total Content',
      value: data?.totalContent ?? '—',
      icon: FileText,
    },
    {
      label: 'Total Sales',
      value: data?.totalSales ?? '—',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Analytics</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
