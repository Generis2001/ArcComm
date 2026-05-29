'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { BadgeCheck, FileText } from 'lucide-react';
import { formatUsdc } from '@/lib/payments/usdc';
import { SubscribeButton } from '@/components/payments/SubscribeButton';
import type { CreatorProfile } from '@/types/creator';

interface CreatorCardProps {
  creator: CreatorProfile;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const tier = creator.subscriptionTiers
    .filter((t) => t.isActive)
    .sort((a, b) => Number(BigInt(a.priceUsdc) - BigInt(b.priceUsdc)))[0];

  const contentPreview = creator.content?.slice(0, 3) ?? [];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-arc-600/40 transition-all hover:shadow-lg hover:shadow-arc-600/5">
      {/* Banner — clicking goes to profile */}
      <Link href={`/app/creator/${creator.handle}`} className="block">
        {creator.bannerUrl ? (
          <div className="relative h-24 w-full">
            <Image src={creator.bannerUrl} alt="" fill className="object-cover" />
          </div>
        ) : (
          <div className="h-24 w-full bg-gradient-to-br from-arc-800 to-arc-950" />
        )}
      </Link>

      <div className="p-4 pt-2 space-y-3">
        {/* Name row — clicking goes to profile */}
        <Link href={`/app/creator/${creator.handle}`} className="block">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold hover:text-arc-400 transition-colors">{creator.displayName}</p>
            {creator.isVerified && <BadgeCheck className="h-4 w-4 text-arc-400" />}
          </div>
          <p className="text-xs text-muted-foreground">@{creator.handle}</p>
        </Link>

        {creator.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">{creator.bio}</p>
        )}

        {contentPreview.length > 0 && (
          <div className="space-y-1.5 pt-0.5">
            {contentPreview.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="truncate text-muted-foreground">{item.title}</span>
                </div>
                {item.isFree ? (
                  <span className="text-emerald-500 shrink-0">Free</span>
                ) : item.priceUsdc ? (
                  <span className="text-arc-400 font-medium shrink-0">{formatUsdc(BigInt(item.priceUsdc))}</span>
                ) : (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">Sub</Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Subscribe button — interactive, outside the Link */}
        {tier && (
          <div className="pt-1">
            <SubscribeButton creatorId={creator.id} tier={tier} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
