'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet } from 'lucide-react';

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
      <Button variant="arc" size="lg" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (authenticated) {
    return (
      <Button variant="arc" size="lg" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Redirecting...
      </Button>
    );
  }

  return (
    <Button variant="arc" size="lg" onClick={login} className="gap-2">
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
