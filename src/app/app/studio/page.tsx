'use client';

import Link from 'next/link';
import { Loader2, PlusCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        <Loader2 className="h-6 w-6 animate-spin text-white/[0.58]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="arc-panel flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-white/[0.52]">Welcome back</p>
          <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">@{me.creator.handle}</p>
        </div>
        <Button variant="arc" size="sm" asChild>
          <Link href="/app/studio/content/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New content
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ['/app/studio/earnings', 'Earnings', 'Review routed USDC and creator withdrawals.'],
          ['/app/studio/content', 'Content', 'Publish premium media and track gated inventory.'],
          ['/app/studio/subscribers', 'Subscribers', 'Review active subscriber access periods.'],
          ['/app/studio/analytics', 'Analytics', 'Watch conversion and engagement signals.'],
        ].map(([href, title, description]) => (
          <Card key={href} className="border-white/[0.10] bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-6 text-white/[0.56]">{description}</p>
              <Link href={href} className="text-sm text-white underline-offset-4 hover:underline">
                Open panel
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
