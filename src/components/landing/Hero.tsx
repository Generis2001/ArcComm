import Link from 'next/link';
import { ArrowUpRight, Radio, ShieldCheck, Wallet } from 'lucide-react';
import { ConnectButton } from '@/components/auth/ConnectButton';

const signalCards = [
  {
    label: 'Subscriptions',
    value: 'Wallet-native recurring support',
    detail: 'Fans subscribe with USDC and creators keep ownership of the relationship.',
  },
  {
    label: 'Commerce',
    value: 'Content, communities, digital drops',
    detail: 'One platform for gated posts, premium rooms, and store revenue.',
  },
  {
    label: 'Settlement',
    value: 'Arc Testnet · USDC fees',
    detail: 'Network-native payments without card processors or payout lag.',
  },
];

export function Hero() {
  return (
    <section className="arc-watermark relative overflow-hidden px-6 pt-28 text-left" data-watermark="ARCCOMM">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 py-16 lg:grid-cols-[minmax(0,1.1fr)_420px]">
        <div className="relative z-10 max-w-3xl space-y-8">
          <div className="arc-kicker">
            <Radio className="h-3.5 w-3.5" />
            Creator revenue infrastructure for Arc
          </div>

          <div className="space-y-6">
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.08em] text-white md:text-7xl">
              Build audience gravity.
              <br />
              Keep the money path direct.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/[0.68] md:text-xl">
              ArcComm turns Arc Testnet into a clean creator operating system: subscriptions,
              gated communities, premium drops, and instant USDC settlement in one black-and-white
              control surface.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <ConnectButton />
            <Link
              href="#experience"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.03] px-6 py-3 text-sm text-white/[0.72] transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              See the product system
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="arc-panel p-4">
              <div className="mb-6 flex items-center justify-between text-[0.7rem] uppercase tracking-[0.22em] text-white/[0.42]">
                <span>Network</span>
                <ShieldCheck className="h-4 w-4 text-white/[0.60]" />
              </div>
              <p className="text-base font-medium text-white">Arc Testnet routing</p>
              <p className="mt-2 text-sm leading-6 text-white/[0.58]">
                Built for USDC-denominated payments, creator payouts, and gated membership logic.
              </p>
            </div>

            <div className="arc-panel p-4 md:col-span-2">
              <div className="mb-6 flex items-center justify-between text-[0.7rem] uppercase tracking-[0.22em] text-white/[0.42]">
                <span>Control Plane</span>
                <Wallet className="h-4 w-4 text-white/[0.60]" />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {signalCards.map((card) => (
                  <div key={card.label} className="space-y-2 rounded-[1.25rem] border border-white/[0.08] bg-black/[0.35] p-4">
                    <p className="text-[0.7rem] uppercase tracking-[0.18em] text-white/[0.38]">{card.label}</p>
                    <p className="text-base font-medium text-white">{card.value}</p>
                    <p className="text-sm leading-6 text-white/[0.54]">{card.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="arc-panel overflow-hidden p-5">
            <div className="flex items-center justify-between rounded-[1.25rem] border border-white/[0.08] bg-white/[0.03] px-4 py-3">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/[0.42]">Live surface</p>
                <p className="mt-1 text-lg font-medium text-white">ArcComm Console</p>
              </div>
              <div className="rounded-full border border-white/[0.10] px-3 py-1 text-xs text-white/[0.58]">
                Preview
              </div>
            </div>

            <div className="mt-5 space-y-4 rounded-[1.5rem] border border-white/[0.08] bg-black p-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <p className="text-sm text-white/[0.48]">Creator heartbeat</p>
                  <p className="mt-1 text-3xl font-semibold tracking-[-0.06em] text-white">$18.4k</p>
                </div>
                <div className="rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 text-xs text-white/[0.60]">
                  USDC routed
                </div>
              </div>

              <div className="space-y-3">
                {[
                  'Drop premium video access directly after settlement',
                  'Gate Discord and Telegram communities off active tiers',
                  'Withdraw creator balances without payout batching',
                ].map((line, index) => (
                  <div
                    key={line}
                    className="flex items-start gap-3 rounded-[1.1rem] border border-white/[0.07] bg-white/[0.02] px-4 py-3"
                  >
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/[0.10] text-xs text-white/[0.54]">
                      0{index + 1}
                    </span>
                    <p className="text-sm leading-6 text-white/[0.68]">{line}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.1rem] border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-[0.7rem] uppercase tracking-[0.18em] text-white/[0.38]">Membership</p>
                  <p className="mt-2 text-xl font-medium text-white">4 active revenue modes</p>
                  <p className="mt-2 text-sm leading-6 text-white/[0.54]">
                    Subscription tiers, community access, creator drops, and one-off purchases.
                  </p>
                </div>
                <div className="rounded-[1.1rem] border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-[0.7rem] uppercase tracking-[0.18em] text-white/[0.38]">Payout timing</p>
                  <p className="mt-2 text-xl font-medium text-white">On demand</p>
                  <p className="mt-2 text-sm leading-6 text-white/[0.54]">
                    Wallet-connected creators can request funds without leaving the application shell.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
