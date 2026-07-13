import { ArcWordmark } from '@/components/ui/ArcBadge';
import { LogoWordmark } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <LogoWordmark size={30} />
          <p className="max-w-lg text-sm leading-6 text-white/[0.54]">
            ArcComm is built for creator subscriptions, gated experiences, and digital products on
            Arc Testnet with USDC-native settlement.
          </p>
        </div>

        <div className="space-y-3 text-left md:text-right">
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/[0.42]">Network</p>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/[0.10] bg-white/[0.04] px-4 py-2">
            <ArcWordmark />
            <span className="text-xs uppercase tracking-[0.18em] text-white/[0.46]">Official docs mark</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
