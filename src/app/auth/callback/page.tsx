'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

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
      <Loader2 className="h-6 w-6 animate-spin text-white/[0.70]" />
      <p className="text-white/[0.58]">Signing you into Cohora...</p>
    </div>
  );
}
