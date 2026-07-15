'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, ShoppingBag, Compass, Download, Music, Play, FileText, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { formatUsdc } from '@/lib/payments/usdc';

interface PurchasedContent {
  id: string;
  title: string;
  type: string;
  mediaUrl: string | null;
  description: string | null;
  creator: { handle: string; displayName: string };
}

interface Purchase {
  id: string;
  type: 'CONTENT' | 'PRODUCT';
  amountUsdc: string;
  createdAt: string;
  content?: PurchasedContent;
  product?: { name: string; creator: { handle: string; displayName: string } };
}

const TYPE_ICON: Record<string, React.ElementType> = {
  VIDEO: Play,
  AUDIO: Music,
  ARTICLE: FileText,
  IMAGE_GALLERY: ImageIcon,
  FILE: Download,
};

function ContentModal({ content, open, onClose }: { content: PurchasedContent; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            by{' '}
            <Link href={`/app/creator/${content.creator.handle}`} className="hover:text-arc-400 transition-colors" onClick={onClose}>
              {content.creator.displayName}
            </Link>
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {content.type === 'VIDEO' && content.mediaUrl && (
            <video
              src={content.mediaUrl}
              controls
              autoPlay={false}
              className="w-full rounded-lg bg-black"
              style={{ maxHeight: '60vh' }}
              preload="metadata"
            />
          )}

          {content.type === 'AUDIO' && content.mediaUrl && (
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-4">
              <Music className="h-6 w-6 text-arc-400 shrink-0" />
              <audio src={content.mediaUrl} controls className="w-full" preload="metadata" />
            </div>
          )}

          {content.type === 'IMAGE_GALLERY' && content.mediaUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.mediaUrl} alt={content.title} className="w-full rounded-lg object-contain max-h-[60vh]" />
          )}

          {content.type === 'FILE' && content.mediaUrl && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Download className="h-12 w-12 text-arc-400" />
              <p className="text-sm text-muted-foreground">Your file is ready to download.</p>
              <Button variant="arc" asChild>
                <a href={content.mediaUrl} target="_blank" rel="noopener noreferrer" download>
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </a>
              </Button>
            </div>
          )}

          {content.type === 'ARTICLE' && content.description && (
            <div className="prose prose-sm prose-invert max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
              {content.description}
            </div>
          )}

          {!content.mediaUrl && content.type !== 'ARTICLE' && (
            <p className="text-sm text-muted-foreground text-center py-4">No media available for this content.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PurchasesPage() {
  const { getAccessToken } = usePrivy();
  const [selected, setSelected] = useState<PurchasedContent | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch('/api/purchases', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json() as Promise<Purchase[]>;
    },
  });

  return (
    <div className="space-y-6">
      <section className="arc-panel arc-watermark p-6 md:p-8" data-watermark="PURCHASES">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/[0.40]">Purchases</p>
            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-white">Content and products you own.</h1>
            <p className="text-sm text-white/[0.56]">Open paid content and downloads purchased from Arcom creators.</p>
          </div>
          <Button variant="arc" size="sm" asChild>
            <Link href="/app/explore">
              <Compass className="mr-2 h-4 w-4" />
              Explore creators
            </Link>
          </Button>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">You have not purchased anything yet.</p>
          <p className="text-sm text-muted-foreground/60">Use the button above to browse creator content.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {data.map((purchase) => {
            const creator = purchase.content?.creator ?? purchase.product?.creator;
            const label = purchase.content?.title ?? purchase.product?.name ?? 'Purchase';
            const TypeIcon = purchase.content ? (TYPE_ICON[purchase.content.type] ?? FileText) : ShoppingBag;
            const isViewable = !!purchase.content;

            return (
              <Card
                key={purchase.id}
                className={isViewable ? 'cursor-pointer hover:border-arc-600/50 transition-colors' : ''}
                onClick={() => isViewable && purchase.content && setSelected(purchase.content)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <TypeIcon className="h-4 w-4 text-arc-400 shrink-0" />
                      <CardTitle className="text-base truncate">{label}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {purchase.content && (
                        <Badge variant="secondary" className="text-xs">{purchase.content.type.replace('_', ' ')}</Badge>
                      )}
                      <Badge variant="outline">{purchase.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-muted-foreground space-y-1">
                    {creator && (
                      <p>
                        From:{' '}
                        <span
                          className="text-foreground hover:text-arc-400 transition-colors cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                          <Link href={`/app/creator/${creator.handle}`} onClick={(e) => e.stopPropagation()}>
                            {creator.displayName}
                          </Link>
                        </span>
                      </p>
                    )}
                    <p>Amount: <span className="text-foreground">{formatUsdc(BigInt(purchase.amountUsdc))}</span></p>
                    <p>{new Date(purchase.createdAt).toLocaleDateString()}</p>
                  </div>
                  {isViewable && (
                    <p className="text-xs text-arc-400 font-medium">Click to view →</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selected && (
        <ContentModal
          content={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
