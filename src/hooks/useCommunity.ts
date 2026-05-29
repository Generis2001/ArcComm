'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';

export interface CommunityDetail {
  id: string;
  name: string;
  description: string | null;
  entryFeeUsdc: string;
  entryFeeFormatted: string;
  revenueSplitPct: number;
  memberCount: number;
  isMember: boolean;
  isCreator: boolean;
  creator: {
    id: string;
    handle: string;
    displayName: string;
    user: { avatarUrl: string | null; walletAddress: string };
  };
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  body: string;
  mediaUrl: string | null;
  mediaType: string | null;
  createdAt: string;
  creator: {
    handle: string;
    displayName: string;
    user: { avatarUrl: string | null };
  };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export function useCommunity(communityId: string) {
  return useQuery<CommunityDetail>({
    queryKey: ['community', communityId],
    queryFn: async () => {
      const res = await fetch(`/api/communities/${communityId}`);
      if (!res.ok) throw new Error('Failed to load community');
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useCommunityPosts(communityId: string) {
  const { getAccessToken } = usePrivy();

  return useQuery<{ posts: CommunityPost[]; locked: boolean }>({
    queryKey: ['community-posts', communityId],
    queryFn: async () => {
      let headers: Record<string, string> = {};
      try {
        const token = await getAccessToken();
        if (token) headers = { Authorization: `Bearer ${token}` };
      } catch {
        // unauthenticated
      }
      const res = await fetch(`/api/communities/${communityId}/posts`, { headers });
      if (!res.ok) throw new Error('Failed to load posts');
      return res.json();
    },
    staleTime: 15_000,
  });
}

export function useCommunities() {
  return useQuery<CommunityDetail[]>({
    queryKey: ['communities'],
    queryFn: async () => {
      const res = await fetch('/api/communities');
      if (!res.ok) throw new Error('Failed to load communities');
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useStudioCommunities() {
  const { getAccessToken } = usePrivy();

  return useQuery({
    queryKey: ['studio-communities'],
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch('/api/studio/communities', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load communities');
      return res.json();
    },
    staleTime: 30_000,
  });
}
