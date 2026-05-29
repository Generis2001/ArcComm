'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { PayModal } from '@/components/payments/PayModal';
import { useCommunity } from '@/hooks/useCommunity';
import { Users2 } from 'lucide-react';

interface JoinButtonProps {
  communityId: string;
  creatorId: string;
  entryFeeUsdc: string;
  entryFeeFormatted: string;
}

export function JoinButton({ communityId, creatorId, entryFeeUsdc, entryFeeFormatted }: JoinButtonProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: community, isLoading } = useCommunity(communityId);

  if (isLoading) return null;
  if (community?.isMember || community?.isCreator) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-1.5">
        <Users2 className="h-4 w-4" />
        Member
      </Button>
    );
  }

  return (
    <>
      <Button variant="arc" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Users2 className="h-4 w-4" />
        Join · {entryFeeFormatted}
      </Button>
      <PayModal
        open={open}
        onOpenChange={setOpen}
        title="Join Community"
        description="Pay the one-time entry fee to become a member."
        grossAmountUsdc={BigInt(entryFeeUsdc)}
        payParams={{ creatorId, communityId, type: 'COMMUNITY_JOIN' }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['community', communityId] });
          queryClient.invalidateQueries({ queryKey: ['community-posts', communityId] });
          queryClient.invalidateQueries({ queryKey: ['communities'] });
          setOpen(false);
        }}
      />
    </>
  );
}
