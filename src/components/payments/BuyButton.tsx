'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PayModal } from '@/components/payments/PayModal';
import { formatUsdc } from '@/lib/payments/usdc';
import { ShoppingCart, CheckCircle2 } from 'lucide-react';
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
  const [purchased, setPurchased] = useState(false);

  function handleSuccess() {
    setPurchased(true);
    setOpen(false);
    onSuccess?.();
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
      <Button variant="arc" size="sm" onClick={() => setOpen(true)} className={className}>
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
