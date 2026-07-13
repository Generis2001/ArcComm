import Image from 'next/image';

export function OrbitGraphic() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <div className="absolute inset-[12%] overflow-hidden rounded-full border border-white/[0.10] bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.28),rgba(148,163,184,0.22)_32%,rgba(71,85,105,0.7)_68%,rgba(15,23,42,0.92)_100%)] shadow-[0_0_90px_rgba(148,163,184,0.18)]">
        <div className="earth-surface absolute inset-0">
          <span className="absolute left-[10%] top-[20%] h-[18%] w-[30%] rounded-full bg-white/[0.12] blur-[2px]" />
          <span className="absolute left-[48%] top-[28%] h-[24%] w-[22%] rounded-full bg-white/[0.10] blur-[2px]" />
          <span className="absolute left-[22%] top-[55%] h-[16%] w-[38%] rounded-full bg-white/[0.09] blur-[2px]" />
          <span className="absolute left-[62%] top-[58%] h-[12%] w-[18%] rounded-full bg-white/[0.08] blur-[2px]" />
        </div>
      </div>
      <div className="absolute inset-[18%] rounded-full border border-white/[0.08] bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.08),transparent_60%)]" />
      <div className="absolute inset-[8%] rounded-full border border-white/[0.08]" />
      <div className="absolute inset-[2%] rounded-full border border-white/[0.06]" />

      <div className="orbit-path absolute inset-0">
        <div className="orbit-token orbit-token-a">
          <Image src="/assets/usdc-token-32.webp" alt="USDC" width={44} height={44} className="rounded-full" priority />
        </div>
      </div>

      <div className="orbit-path orbit-reverse absolute inset-[6%]">
        <div className="orbit-token orbit-token-b">
          <Image src="/assets/eurc-token-32.png" alt="EURC" width={42} height={42} className="rounded-full" priority />
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 h-[76%] w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />
      <div className="absolute left-1/2 top-1/2 h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />
    </div>
  );
}
