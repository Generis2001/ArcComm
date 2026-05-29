'use client';

import { useQuery } from '@tanstack/react-query';
import type { CreatorProfile } from '@/types/creator';

export function useCreatorProfile(handle: string) {
  return useQuery({
    queryKey: ['creator', handle],
    enabled: Boolean(handle),
    queryFn: async () => {
      const res = await fetch(`/api/creators/${handle}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch creator');
      }
      return res.json() as Promise<CreatorProfile>;
    },
    staleTime: 60_000,
  });
}
