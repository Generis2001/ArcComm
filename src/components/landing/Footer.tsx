import { ArcWordmark } from '@/components/ui/ArcBadge';
import { LogoWordmark } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <LogoWordmark size={30} />
          <p className="max-w-lg text-sm leading-6 text-white/[0.54]">
            Arcom is a creator platform for subscriptions, gated communities, premium content,
            and digital products paid in USDC on Arc Testnet.
          </p>
        </div>

        <ArcWordmark />
      </div>
    </footer>
  );
}
