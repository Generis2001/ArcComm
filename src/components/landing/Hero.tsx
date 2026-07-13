import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import { ConnectButton } from '@/components/auth/ConnectButton';
import { OrbitGraphic } from '@/components/ui/OrbitGraphic';

const highlights = [
  'Creator profiles for publishing and monetization',
  'USDC payments for subscriptions and one-time purchases',
  'Subscriber communities and gated digital access',
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-28 text-left">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_520px]">
        <div className="relative z-10 max-w-3xl space-y-8">
          <p className="text-sm uppercase tracking-[0.26em] text-white/[0.54]">
            Creator platform on Arc Testnet
          </p>

          <div className="space-y-6">
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.08em] text-white md:text-7xl">
              Subscriptions, communities, and digital products for creators on Arc.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/[0.68] md:text-xl">
              ArcComm lets creators create public profiles, publish paid content, run subscriber
              communities, and sell digital products. Fans connect a wallet, pay in USDC, and get
              access instantly.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <ConnectButton />
            <Link
              href="#product"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.03] px-6 py-3 text-sm text-white/[0.72] transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              See what ArcComm does
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3">
            {highlights.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[1.2rem] border border-white/[0.08] bg-white/[0.03] px-4 py-4">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/[0.10]">
                  <Check className="h-3.5 w-3.5 text-white/[0.72]" />
                </span>
                <p className="text-sm leading-6 text-white/[0.62]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <OrbitGraphic />
        </div>
      </div>
    </section>
  );
}
