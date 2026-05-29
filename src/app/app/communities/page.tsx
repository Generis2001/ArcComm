'use client';

import { useCommunities } from '@/hooks/useCommunity';
import { JoinButton } from '@/components/communities/JoinButton';
import { Users2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CommunitiesPage() {
  const { data: communities, isLoading } = useCommunities();

  const joined = communities?.filter((c) => c.isMember || c.isCreator) ?? [];
  const discover = communities?.filter((c) => !c.isMember && !c.isCreator) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Communities</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Join subscriber communities and earn from revenue distributions.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && joined.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your Communities</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {joined.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        </section>
      )}

      {!isLoading && discover.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Discover</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {discover.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        </section>
      )}

      {!isLoading && communities?.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Users2 className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No communities yet</p>
          <p className="text-sm text-muted-foreground">
            Creators can set up communities in their studio.
          </p>
        </div>
      )}
    </div>
  );
}

function CommunityCard({ community }: { community: ReturnType<typeof useCommunities>['data'] extends (infer T)[] | undefined ? T : never }) {
  if (!community) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 hover:border-arc-600/50 transition-colors">
      <Link href={`/app/communities/${community.id}`} className="block space-y-2">
        <div className="flex items-center gap-2">
          {community.creator.user.avatarUrl ? (
            <Image
              src={community.creator.user.avatarUrl}
              alt=""
              width={28}
              height={28}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-arc-500/20 flex items-center justify-center text-xs font-bold text-arc-400">
              {community.creator.displayName[0]}
            </div>
          )}
          <span className="text-xs text-muted-foreground">@{community.creator.handle}</span>
        </div>
        <p className="font-semibold leading-tight">{community.name}</p>
        {community.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{community.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users2 className="h-3.5 w-3.5" />
            {community.memberCount} members
          </span>
          <span>{community.entryFeeFormatted} entry</span>
        </div>
      </Link>
      <JoinButton
        communityId={community.id}
        creatorId={community.creator.id}
        entryFeeUsdc={community.entryFeeUsdc}
        entryFeeFormatted={community.entryFeeFormatted}
      />
    </div>
  );
}
