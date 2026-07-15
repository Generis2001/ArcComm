'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Users2 } from 'lucide-react';
import { JoinButton } from '@/components/communities/JoinButton';
import { useCommunities } from '@/hooks/useCommunity';

export default function CommunitiesPage() {
  const { data: communities, isLoading } = useCommunities();

  const joined = communities?.filter((c) => c.isMember || c.isCreator) ?? [];
  const discover = communities?.filter((c) => !c.isMember && !c.isCreator) ?? [];

  return (
    <div className="space-y-8">
      <div className="py-2">
        <div className="relative z-10 space-y-2">
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/[0.40]">Communities</p>
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-white">Join creator communities with paid access.</h1>
          <p className="text-sm text-white/[0.56]">Find communities you already belong to or discover new creator spaces.</p>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-white/[0.56]" />
        </div>
      )}

      {!isLoading && joined.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/[0.42]">Your communities</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {joined.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        </section>
      )}

      {!isLoading && discover.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/[0.42]">Discover</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {discover.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        </section>
      )}

      {!isLoading && communities?.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Users2 className="h-10 w-10 text-white/[0.38]" />
          <p className="font-medium text-white">No communities yet</p>
          <p className="text-sm text-white/[0.54]">Creators can set up communities in their studio.</p>
        </div>
      )}
    </div>
  );
}

function CommunityCard({
  community,
}: {
  community: ReturnType<typeof useCommunities>['data'] extends (infer T)[] | undefined ? T : never;
}) {
  if (!community) return null;
  return (
    <div className="rounded-[1.4rem] border border-white/[0.10] bg-white/[0.03] p-4 transition-transform duration-200 hover:-translate-y-1">
      <Link href={`/app/communities/${community.id}`} className="block space-y-3">
        <div className="flex items-center gap-2">
          {community.creator.user.avatarUrl ? (
            <Image src={community.creator.user.avatarUrl} alt="" width={28} height={28} className="rounded-full object-cover" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.05] text-xs font-bold text-white/[0.72]">
              {community.creator.displayName[0]}
            </div>
          )}
          <span className="text-xs text-white/[0.48]">@{community.creator.handle}</span>
        </div>
        <p className="font-semibold leading-tight text-white">{community.name}</p>
        {community.description && <p className="line-clamp-2 text-sm text-white/[0.54]">{community.description}</p>}
        <div className="flex items-center gap-3 text-xs text-white/[0.44]">
          <span className="flex items-center gap-1">
            <Users2 className="h-3.5 w-3.5" />
            {community.memberCount} members
          </span>
          <span>{community.entryFeeFormatted} entry</span>
        </div>
      </Link>
      <div className="mt-4">
        <JoinButton
          communityId={community.id}
          creatorId={community.creator.id}
          entryFeeUsdc={community.entryFeeUsdc}
          entryFeeFormatted={community.entryFeeFormatted}
        />
      </div>
    </div>
  );
}
