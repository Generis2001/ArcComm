'use client';

import { useQuery } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreatorSetup } from '@/components/studio/CreatorSetup';
import Link from 'next/link';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function StudioHomePage() {
  const { getAccessToken } = usePrivy();

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch('/api/auth/me', {
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

  if (!me?.creator) {
    return <CreatorSetup />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Welcome back, <span className="text-foreground font-medium">@{me.creator.handle}</span>
        </p>
        <Button variant="arc" size="sm" asChild>
          <Link href="/app/studio/content/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Content
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/app/studio/earnings" className="text-sm text-arc-400 hover:underline">
              View earnings →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/app/studio/content" className="text-sm text-arc-400 hover:underline">
              Manage content →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/app/studio/subscribers" className="text-sm text-arc-400 hover:underline">
              View subscribers →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/app/studio/analytics" className="text-sm text-arc-400 hover:underline">
              View analytics →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
