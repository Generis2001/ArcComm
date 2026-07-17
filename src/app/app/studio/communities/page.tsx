'use client';

import { useStudioCommunities } from '@/hooks/useCommunity';
import { Button } from '@/components/ui/button';
import { Users2, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function StudioCommunitiesPage() {
  const { data: communities, isLoading } = useStudioCommunities();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Communities</h2>
          <p className="text-sm text-muted-foreground">Create and manage your subscriber communities.</p>
        </div>
        <Button variant="cohora" size="sm" asChild>
          <Link href="/app/studio/communities/new">
            <Plus className="mr-2 h-4 w-4" />
            New Community
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && communities?.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center rounded-xl border border-dashed border-border">
          <Users2 className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No communities yet</p>
          <p className="text-sm text-muted-foreground">Create your first community to start engaging with subscribers.</p>
          <Button variant="cohora" size="sm" asChild>
            <Link href="/app/studio/communities/new">Create Community</Link>
          </Button>
        </div>
      )}

      {!isLoading && communities && communities.length > 0 && (
        <div className="space-y-3">
          {communities.map((c: {
            id: string;
            name: string;
            description: string | null;
            memberCount: number;
            communityPoolFormatted: string;
            entryFeeFormatted: string;
            revenueSplitPct: number;
            isActive: boolean;
            lastDistributedAt: string | null;
          }) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{c.name}</p>
                    {!c.isActive && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                  </div>
                  {c.description && <p className="text-sm text-muted-foreground mt-0.5">{c.description}</p>}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/app/communities/${c.id}`}>View</Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-xs text-muted-foreground">Members</p>
                  <p className="font-semibold">{c.memberCount}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-xs text-muted-foreground">Pool Balance</p>
                  <p className="font-semibold">{c.communityPoolFormatted}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-xs text-muted-foreground">Entry Fee</p>
                  <p className="font-semibold">{c.entryFeeFormatted}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-xs text-muted-foreground">Your Split</p>
                  <p className="font-semibold">{c.revenueSplitPct}%</p>
                </div>
              </div>

              {c.lastDistributedAt && (
                <p className="text-xs text-muted-foreground">
                  Last distribution: {new Date(c.lastDistributedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
