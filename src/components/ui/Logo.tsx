'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils/cn';

// ─── Arch A SVG constants ─────────────────────────────────────────────────────
// ViewBox: 48 × 70 (with dollar sign) | 48 × 44 (mark only)
// Outer arch: center (24,24) r=22 → left x=2, right x=46, apex (24,2)
// Inner arch: center (24,24) r=12 → left x=12, right x=36, apex (24,12)
// Crossbar: originates from right inner (x=36), curves toward left,
//           terminates at x≈15 — gap of 3 units from left inner leg (x=12)
// Dollar sign: S-curve + vertical stem, centered x=24, y=47-68

const ARCH_PATH = [
  // Outer arch (clockwise)
  'M 2 42 L 2 24 A 22 22 0 0 0 46 24 L 46 42 Z',
  // Inner hollow (makes a hole via evenodd)
  'M 12 42 L 36 42 L 36 24 A 12 12 0 0 0 12 24 L 12 42 Z',
  // Crossbar (3rd sub-path → odd count inside hollow → fills back in)
  'M 36 30 C 30 26 18 29 15 33 C 14 34 14 37 16 38 C 19 39 30 38 36 38 Z',
].join(' ');

const DOLLAR_S_PATH =
  'M 34 51 C 34 47 14 47 14 52 C 14 57 34 57 34 62 C 34 67 14 67 14 63';

// ─── Component ────────────────────────────────────────────────────────────────

interface LogoMarkProps {
  size?: number;
  showDollar?: boolean;
  className?: string;
}

export function LogoMark({ size = 32, showDollar = true, className }: LogoMarkProps) {
  const uid = useId().replace(/:/g, '');
  const gradId = `arcGrad-${uid}`;
  const glowId = `arcGlow-${uid}`;

  const viewBox = showDollar ? '0 0 48 70' : '0 0 48 44';
  const gradY2 = showDollar ? '68' : '42';
  const aspectRatio = showDollar ? 48 / 70 : 48 / 44;
  const width = Math.round(size * aspectRatio);

  return (
    <svg
      width={width}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ArcCom"
      role="img"
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="2" y1="2"
          x2="46" y2={gradY2}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#D4E4FF" />
          <stop offset="38%"  stopColor="#7B9FF5" />
          <stop offset="100%" stopColor="#2138CC" />
        </linearGradient>
        <filter id={glowId} x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="0.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Arch A */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill={`url(#${gradId})`}
        filter={`url(#${glowId})`}
        d={ARCH_PATH}
      />

      {/* Dollar sign */}
      {showDollar && (
        <g
          stroke={`url(#${gradId})`}
          strokeLinecap="round"
          fill="none"
          filter={`url(#${glowId})`}
        >
          <path strokeWidth="3.4" d={DOLLAR_S_PATH} />
          <line x1="24" y1="45" x2="24" y2="68" strokeWidth="2.8" />
        </g>
      )}
    </svg>
  );
}

// ─── Wordmark: icon + text ─────────────────────────────────────────────────────

interface LogoWordmarkProps {
  size?: number;        // icon height in px
  className?: string;
  showDollar?: boolean;
}

export function LogoWordmark({
  size = 28,
  className,
  showDollar = false,
}: LogoWordmarkProps) {
  const fontSize = Math.round(size * 0.64);

  return (
    <div className={cn('flex items-center', className)} style={{ gap: Math.round(size * 0.3) }}>
      <LogoMark size={size} showDollar={showDollar} />
      <span
        className="font-bold tracking-tight text-foreground"
        style={{ fontSize, lineHeight: 1 }}
      >
        ArcCom
      </span>
    </div>
  );
}
