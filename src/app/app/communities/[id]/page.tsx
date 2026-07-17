'use client';

import { use } from 'react';
import { useCommunity, useCommunityPosts } from '@/hooks/useCommunity';
import { JoinButton } from '@/components/communities/JoinButton';
import { PostCard } from '@/components/communities/PostCard';
import { CreatePostForm } from '@/components/communities/CreatePostForm';
import { Users2, Loader2, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CommunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: community, isLoading: loadingCommunity } = useCommunity(id);
  const { data: postsData, isLoading: loadingPosts } = useCommunityPosts(id);

  if (loadingCommunity) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!community) {
    return <p className="text-muted-foreground">Community not found.</p>;
  }

  const canInteract = community.isMember || community.isCreator;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold">{community.name}</h1>
            {community.description && (
              <p className="text-sm text-muted-foreground">{community.description}</p>
            )}
          </div>
          {!community.isCreator && (
            <JoinButton
              communityId={community.id}
              creatorId={community.creator.id}
              entryFeeUsdc={community.entryFeeUsdc}
              entryFeeFormatted={community.entryFeeFormatted}
            />
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href={`/app/creator/${community.creator.handle}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
            {community.creator.user.avatarUrl ? (
              <Image src={community.creator.user.avatarUrl} alt="" width={20} height={20} className="rounded-full object-cover" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-cohora-500/20 flex items-center justify-center text-xs font-bold text-cohora-400">
                {community.creator.displayName[0]}
              </div>
            )}
            @{community.creator.handle}
          </Link>
          <span className="flex items-center gap-1">
            <Users2 className="h-4 w-4" />
            {community.memberCount} members
          </span>
          <span>{community.entryFeeFormatted} entry</span>
          <span>{community.revenueSplitPct}% creator / {100 - community.revenueSplitPct}% members</span>
        </div>
      </div>

      {/* Posts */}
      {community.isCreator && <CreatePostForm communityId={id} />}

      {loadingPosts ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : postsData?.locked ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center rounded-xl border border-border bg-card">
          <Lock className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">Members only</p>
          <p className="text-sm text-muted-foreground">
            Join this community to see posts and participate.
          </p>
        </div>
      ) : postsData?.posts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
          <p className="text-sm">No posts yet. The creator hasn&apos;t posted anything.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {postsData?.posts.map((post) => (
            <PostCard key={post.id} post={post} communityId={id} canInteract={canInteract} />
          ))}
        </div>
      )}
    </div>
  );
}
