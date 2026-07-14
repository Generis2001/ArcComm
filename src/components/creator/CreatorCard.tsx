'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, FileText, Film } from 'lucide-react';
import { SubscribeButton } from '@/components/payments/SubscribeButton';
import { Badge } from '@/components/ui/badge';
import { formatUsdc } from '@/lib/payments/usdc';
import type { CreatorProfile } from '@/types/creator';

interface CreatorCardProps {
  creator: CreatorProfile;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const tier = creator.subscriptionTiers
    .filter((t) => t.isActive)
    .sort((a, b) => Number(BigInt(a.priceUsdc) - BigInt(b.priceUsdc)))[0];

  const contentPreview = creator.content?.slice(0, 3) ?? [];
  const featuredVideo = contentPreview.find(
    (item) => item.type === 'VIDEO' && item.mediaUrl && item.accessType !== 'SUBSCRIPTION',
  );

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/[0.10] bg-white/[0.03] transition-transform duration-200 hover:-translate-y-1">
      <Link href={`/app/creator/${creator.handle}`} className="block">
        {creator.bannerUrl ? (
          <div className="relative h-24 w-full">
            <Image src={creator.bannerUrl} alt="" fill className="object-cover" />
          </div>
        ) : (
          <div className="h-24 w-full bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02))]" />
        )}
      </Link>

      <div className="space-y-3 p-4 pt-3">
        <Link href={`/app/creator/${creator.handle}`} className="block">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-white transition-colors hover:text-white/[0.72]">{creator.displayName}</p>
            {creator.isVerified && <BadgeCheck className="h-4 w-4 text-white/[0.72]" />}
          </div>
          <p className="text-xs text-white/[0.44]">@{creator.handle}</p>
        </Link>

        {creator.bio && <p className="line-clamp-2 text-sm text-white/[0.56]">{creator.bio}</p>}

        {featuredVideo?.mediaUrl && (
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-black">
            <video
              src={featuredVideo.mediaUrl}
              controls
              playsInline
              preload="metadata"
              className="aspect-video w-full"
            />
          </div>
        )}

        {contentPreview.length > 0 && (
          <div className="space-y-1.5 pt-0.5">
            {contentPreview.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex min-w-0 items-center gap-1.5">
                  {item.type === 'VIDEO' ? (
                    <Film className="h-3 w-3 shrink-0 text-white/[0.34]" />
                  ) : (
                    <FileText className="h-3 w-3 shrink-0 text-white/[0.34]" />
                  )}
                  <span className="truncate text-white/[0.52]">{item.title}</span>
                </div>
                {item.isFree ? (
                  <span className="shrink-0 text-emerald-300">Free</span>
                ) : item.accessType === 'SUBSCRIPTION' ? (
                  <Badge variant="outline" className="shrink-0 border-amber-400/30 px-1 py-0 text-[10px] text-amber-300">
                    Premium
                  </Badge>
                ) : item.priceUsdc ? (
                  <span className="shrink-0 font-medium text-white/[0.84]">{formatUsdc(BigInt(item.priceUsdc))}</span>
                ) : (
                  <Badge variant="outline" className="shrink-0 px-1 py-0 text-[10px]">
                    Sub
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {tier && (
          <div className="pt-1">
            <SubscribeButton creatorId={creator.id} tier={tier} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
