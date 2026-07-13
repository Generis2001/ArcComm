'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { CreatorSetup } from '@/components/studio/CreatorSetup';

export function CreatorGuard({ children }: { children: React.ReactNode }) {
  const { getAccessToken, authenticated, ready } = usePrivy();

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    enabled: ready && authenticated,
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
  });

  if (!ready || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/[0.70]" />
      </div>
    );
  }

  if (!me?.creator) {
    return <CreatorSetup />;
  }

  return <>{children}</>;
}
