'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, FileText, EyeOff, Eye, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { formatUsdc } from '@/lib/payments/usdc';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  isPremium: boolean;
  priceUsdc?: string;
  isPublished: boolean;
  moderationStatus: string;
  salesCount: number;
  createdAt: string;
}

function useTogglePublished() {
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  async function toggle(id: string, currentlyPublished: boolean) {
    setPending(id);
    setToggleError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/studio/content/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isPublished: !currentlyPublished }),
      });
      if (!res.ok) {
        const d = await res.json();
        setToggleError(d.error ?? 'Failed to update');
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['studio-content'] });
    } finally {
      setPending(null);
    }
  }

  return { toggle, pending, toggleError };
}

export default function StudioContentPage() {
  const { getAccessToken } = usePrivy();
  const { toggle, pending, toggleError } = useTogglePublished();

  const { data, isLoading } = useQuery({
    queryKey: ['studio-content'],
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch('/api/studio/content', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json() as Promise<ContentItem[]>;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Content</h2>
        <Button variant="arc" size="sm" asChild>
          <Link href="/app/studio/content/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Content
          </Link>
        </Button>
      </div>

      {toggleError && (
        <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{toggleError}</p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <FileText className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">No content yet.</p>
          <Button variant="arc" size="sm" asChild>
            <Link href="/app/studio/content/new">Create your first piece</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {data.map((item) => {
            const isFlagged = item.moderationStatus === 'FLAGGED';
            return (
              <Card key={item.id} className={!item.isPublished ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base truncate">{item.title}</CardTitle>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline">{item.type}</Badge>
                      {item.isPremium && <Badge variant="default">Premium</Badge>}
                      {isFlagged ? (
                        <Badge variant="destructive">Flagged</Badge>
                      ) : (
                        <Badge variant={item.isPublished ? 'default' : 'secondary'}>
                          {item.isPublished ? 'Listed' : 'Delisted'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Moderation notice for flagged content */}
                {isFlagged && (
                  <div className="mx-4 mb-1 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-xs text-destructive">
                      This content has been flagged as potentially violating ArcCom community standards and cannot be published until reviewed.
                    </p>
                  </div>
                )}

                <CardContent className="text-sm text-muted-foreground">
                  {item.priceUsdc && (
                    <p>Price: <span className="text-foreground">{formatUsdc(BigInt(item.priceUsdc))}</span></p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-4">
                      <p className="text-xs">{new Date(item.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs">{item.salesCount ?? 0} {item.salesCount === 1 ? 'sale' : 'sales'}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggle(item.id, item.isPublished)}
                      disabled={pending === item.id || isFlagged}
                      title={isFlagged ? 'Cannot publish flagged content' : undefined}
                      className="h-7 px-2 text-xs"
                    >
                      {pending === item.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : item.isPublished ? (
                        <><EyeOff className="mr-1 h-3 w-3" />Delist</>
                      ) : (
                        <><Eye className="mr-1 h-3 w-3" />Relist</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
