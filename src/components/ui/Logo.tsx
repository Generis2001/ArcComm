'use client';

import { cn } from '@/lib/utils/cn';

const ARCH_PATH = [
  'M 2 42 L 2 24 A 22 22 0 0 0 46 24 L 46 42 Z',
  'M 12 42 L 36 42 L 36 24 A 12 12 0 0 0 12 24 L 12 42 Z',
  'M 36 30 C 30 26 18 29 15 33 C 14 34 14 37 16 38 C 19 39 30 38 36 38 Z',
].join(' ');

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 28, className }: LogoMarkProps) {
  const width = Math.round(size * (48 / 44));

  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 48 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-foreground', className)}
      aria-label="Arcom"
      role="img"
    >
      <rect x="1" y="1" width="46" height="42" rx="14" stroke="currentColor" strokeOpacity="0.18" />
      <path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d={ARCH_PATH} />
    </svg>
  );
}

interface LogoWordmarkProps {
  size?: number;
  className?: string;
}

export function LogoWordmark({ size = 28, className }: LogoWordmarkProps) {
  const fontSize = Math.round(size * 0.68);

  return (
    <div
      className={cn('flex items-center', className)}
      style={{ gap: Math.round(size * 0.34) }}
    >
      <LogoMark size={size} />

      <span
        className="font-semibold leading-none tracking-[0.02em] text-white/[0.60]"
        style={{ fontSize }}
        aria-label="Arcom"
        role="img"
      >
        Cohora
      </span>
    </div>
  );
}
