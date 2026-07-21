'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowUpRight, Loader2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ConnectButton() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/app');
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <Button variant="cohora" size="xl" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading wallet access
      </Button>
    );
  }

  if (authenticated) {
    return (
      <Button variant="cohora" size="xl" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Opening Cohora
      </Button>
    );
  }

  return (
    <Button variant="cohora" size="xl" onClick={login} className="gap-2 px-7">
      <Wallet className="h-4 w-4" />
      Connect wallet
      <ArrowUpRight className="h-4 w-4" />
    </Button>
  );
}
