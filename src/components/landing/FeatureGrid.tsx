import { DollarSign, Lock, Repeat, ShoppingBag, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: DollarSign,
    title: 'USDC-native payments',
    description: 'Every transaction uses USDC on Arc Testnet. Stable, fast, and wallet-direct.',
  },
  {
    icon: Repeat,
    title: 'Recurring subscriptions',
    description: 'Fans subscribe once. Creators earn every month. Simple renewal enforcement.',
  },
  {
    icon: Lock,
    title: 'Content gating',
    description: 'Publish exclusive posts, videos, and downloads — only subscribers can access.',
  },
  {
    icon: ShoppingBag,
    title: 'Digital storefront',
    description: 'Sell digital downloads, NFT access passes, and community invites.',
  },
  {
    icon: Users,
    title: 'Gated communities',
    description: 'Automatically deliver Discord or Telegram invites to paying members.',
  },
  {
    icon: Zap,
    title: 'Instant withdrawals',
    description: 'Creators withdraw earned USDC directly to their wallet, anytime.',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="bg-background px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Everything creators need</h2>
          <p className="mt-3 text-muted-foreground">
            Built for creators who want full ownership of their earnings.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6 space-y-3 hover:border-arc-600/50 transition-colors"
            >
              <div className="inline-flex rounded-lg bg-arc-600/10 p-2.5">
                <f.icon className="h-5 w-5 text-arc-400" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
