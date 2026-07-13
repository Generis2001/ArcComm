import { ArrowRight, LockKeyhole, RadioTower, ShoppingBag, Sparkles, Users2, WalletCards } from 'lucide-react';

const productFeatures = [
  {
    icon: WalletCards,
    title: 'Stablecoin-native payments',
    description: 'ArcComm keeps the revenue loop onchain with USDC-denominated flows, clear balances, and direct creator settlement.',
  },
  {
    icon: LockKeyhole,
    title: 'Access that follows payment state',
    description: 'Subscriptions unlock posts, premium drops, and community rooms without off-platform reconciliation.',
  },
  {
    icon: ShoppingBag,
    title: 'Storefronts that feel operational',
    description: 'Sell digital products and single-purchase content from the same control plane as recurring support.',
  },
  {
    icon: Users2,
    title: 'Communities with economic context',
    description: 'Member access and creator monetization live together instead of across disconnected tools.',
  },
];

const workflow = [
  'Connect a wallet and enter the ArcComm operating surface.',
  'Launch subscription tiers or premium content with USDC pricing.',
  'Let ArcComm handle purchase checks, community gating, and creator payouts.',
];

export function FeatureGrid() {
  return (
    <div className="px-6 pb-24">
      <div className="mx-auto max-w-6xl space-y-10">
        <section id="product" className="arc-panel arc-watermark overflow-hidden p-6 md:p-8" data-watermark="SIGNAL">
          <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-5">
              <div className="arc-kicker">
                <RadioTower className="h-3.5 w-3.5" />
                Product direction
              </div>
              <h2 className="text-3xl font-semibold tracking-[-0.06em] text-white md:text-5xl">
                A quieter, sharper UI for creator finance.
              </h2>
              <p className="arc-copy max-w-xl">
                The new ArcComm surface strips out color noise and leans into hierarchy, spacing,
                contrast, and motion. The result is closer to X’s dark product language: dense when
                it needs to be, calm by default, and unmistakably utility-first.
              </p>
              <div className="space-y-3 text-sm text-white/[0.66]">
                {workflow.map((step, index) => (
                  <div key={step} className="flex items-start gap-3 rounded-[1.15rem] border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/[0.10] text-xs text-white/[0.48]">
                      {index + 1}
                    </span>
                    <span className="leading-6">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {productFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-[1.35rem] border border-white/[0.08] bg-black/[0.55] p-5 transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="mb-5 inline-flex rounded-full border border-white/[0.10] bg-white/[0.05] p-3">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/[0.56]">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="arc-panel p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/[0.42]">Experience</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white md:text-3xl">
                  Landing page, dashboard, and studio now speak the same visual language.
                </h3>
              </div>
              <Sparkles className="h-5 w-5 shrink-0 text-white/[0.60]" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ['Landing', 'Sharper hero composition, editorial copy rhythm, and ArcComm-first watermarks.'],
                ['In-app shell', 'Cleaner navigation, better contrast, and stronger panel structure on desktop and mobile.'],
                ['Wallet flow', 'Connect and disconnect actions now feel immediate instead of state-lagged.'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[1.2rem] border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/[0.56]">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="workflow" className="arc-panel p-6 md:p-8">
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/[0.42]">Core behaviors</p>
            <div className="mt-5 space-y-4">
              {[
                'Subscription purchase states remain legible even on dense creator pages.',
                'Community and storefront surfaces inherit the same monochrome cards and border system.',
                'Official Arc branding is anchored subtly instead of overwhelming the ArcComm brand.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[1.1rem] border border-white/[0.08] bg-black/[0.45] px-4 py-4">
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/[0.48]" />
                  <p className="text-sm leading-6 text-white/[0.62]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
