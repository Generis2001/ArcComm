import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

export function ArcSymbolBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,255,255,0.03)]',
        className,
      )}
      aria-label="Arc"
      title="Arc"
    >
      <Image src="/assets/arc-favicon-32.png" alt="Arc" width={18} height={18} priority />
    </div>
  );
}

export function ArcWordmark({ className }: { className?: string }) {
  return (
    <img
      src="/assets/arc-doc-logo-white.svg"
      alt="Arc"
      className={cn('h-5 w-auto opacity-90', className)}
    />
  );
}
