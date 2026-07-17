'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { PayModal } from '@/components/payments/PayModal';
import { formatUsdc } from '@/lib/payments/usdc';
import { ShoppingCart, CheckCircle2, Loader2 } from 'lucide-react';
import type { PaymentIntent } from '@/types/payment';

interface BuyButtonProps {
  creatorId: string;
  contentId?: string;
  productId?: string;
  priceUsdc: bigint;
  label: string;
  type: PaymentIntent['type'];
  onSuccess?: () => void;
  className?: string;
}

export function BuyButton({ creatorId, contentId, productId, priceUsdc, label, type, onSuccess, className }: BuyButtonProps) {
  const [open, setOpen] = useState(false);
  const { getAccessToken, authenticated, ready } = usePrivy();
  const queryClient = useQueryClient();
  const itemId = contentId ?? productId;

  const { data: purchased = false, isLoading } = useQuery({
    queryKey: ['purchases', 'owned', type, itemId],
    enabled: ready && authenticated && Boolean(itemId),
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch('/api/purchases', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return false;
      const purchases = await res.json() as Array<{ content?: { id: string }; product?: { id?: string; name?: string } }>;
      return purchases.some((purchase) => (
        contentId ? purchase.content?.id === contentId : purchase.product?.id === productId
      ));
    },
  });

  function handleSuccess() {
    queryClient.setQueryData(['purchases', 'owned', type, itemId], true);
    queryClient.invalidateQueries({ queryKey: ['purchases'] });
    setOpen(false);
    onSuccess?.();
  }

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        Checking...
      </Button>
    );
  }

  if (purchased) {
    return (
      <div className={`inline-flex items-center gap-1.5 text-sm text-emerald-500 font-medium ${className ?? ''}`}>
        <CheckCircle2 className="h-4 w-4" />
        Purchased
      </div>
    );
  }

  return (
    <>
      <Button variant="cohora" size="sm" onClick={() => setOpen(true)} className={className}>
        <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
        {label} — {formatUsdc(priceUsdc)}
      </Button>

      <PayModal
        open={open}
        onOpenChange={setOpen}
        onSuccess={handleSuccess}
        title={`Purchase ${label}`}
        grossAmountUsdc={priceUsdc}
        payParams={{ creatorId, contentId, productId, type }}
      />
    </>
  );
}
