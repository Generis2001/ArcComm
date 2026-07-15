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

/**
 * ArcomA — renders a capital 'A' whose crossbar is replaced by a smooth arc
 * (part of a circle's circumference) that curves upward between the two legs.
 */
function ArcomA({ size }: { size: number }) {
  // Proportions relative to font-size so the glyph scales with the wordmark
  const H = size;                        // glyph height
  const W = Math.round(size * 0.68);     // glyph width  (~68% of height, typical A)
  const cx = W / 2;                      // horizontal centre
  const sw = Math.max(1.4, size * 0.09); // stroke width

  // Crossbar sits at ~58% from the top — find where the legs cross that y
  const crossY = H * 0.58;
  // Left leg: from (cx, 0) → (0, H).  At y=crossY: x = cx*(1 - crossY/H)
  const lx = cx * (1 - crossY / H);
  // Right leg mirror
  const rx = W - lx;

  // Arc radius — slightly larger than chord/2 gives a pleasing upward curve
  const chord = rx - lx;
  const arcR  = chord * 0.72;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'bottom' }}
    >
      {/* Left leg */}
      <line x1={cx} y1={0} x2={0} y2={H}
        stroke="white" strokeWidth={sw} strokeLinecap="round" />
      {/* Right leg */}
      <line x1={cx} y1={0} x2={W} y2={H}
        stroke="white" strokeWidth={sw} strokeLinecap="round" />
      {/*
        Arc crossbar — SVG arc from lx→rx at crossY, sweeping UPWARD.
        sweep-flag=0 (counter-clockwise) gives the upward arch shape.
      */}
      <path
        d={`M ${lx} ${crossY} A ${arcR} ${arcR} 0 0 0 ${rx} ${crossY}`}
        stroke="white"
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function LogoWordmark({ size = 28, className }: LogoWordmarkProps) {
  const fontSize = Math.round(size * 0.62);

  return (
    <div
      className={cn('flex items-center', className)}
      style={{ gap: Math.round(size * 0.34) }}
    >
      <LogoMark size={size} />

      {/* Wordmark: custom-A SVG + "rcom" text span */}
      <span
        className="flex items-end leading-none"
        style={{ gap: 0 }}
        aria-label="Arcom"
        role="img"
      >
        <ArcomA size={fontSize} />
        <span
          className="font-semibold tracking-[-0.04em] text-white/[0.60]"
          style={{ fontSize, lineHeight: 1, marginBottom: Math.round(fontSize * 0.04) }}
        >
          rcom
        </span>
      </span>
    </div>
  );
}
