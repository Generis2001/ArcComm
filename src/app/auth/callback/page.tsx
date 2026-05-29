'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const { authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (authenticated) {
      router.replace('/app');
    } else {
      router.replace('/');
    }
  }, [ready, authenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-arc-500" />
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  );
}
