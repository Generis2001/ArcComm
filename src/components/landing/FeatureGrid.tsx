import { CreditCard, LockKeyhole, ShoppingBag, Users2, WalletCards } from 'lucide-react';

const productFeatures = [
  {
    icon: WalletCards,
    title: 'Creator profiles',
    description: 'Each creator gets a public profile with a handle, bio, content, store items, and community access points.',
  },
  {
    icon: CreditCard,
    title: 'Subscriptions in USDC',
    description: 'Fans subscribe with USDC on Arc Testnet and ArcComm tracks access based on the active subscription state.',
  },
  {
    icon: LockKeyhole,
    title: 'Gated content',
    description: 'Creators can publish exclusive posts, media, and downloads that unlock after payment or membership.',
  },
  {
    icon: Users2,
    title: 'Paid communities',
    description: 'ArcComm lets creators open subscriber communities with entry fees and member-only participation.',
  },
  {
    icon: ShoppingBag,
    title: 'Digital products',
    description: 'Creators can list and sell one-time digital products alongside subscriptions from the same dashboard.',
  },
];

const workflow = [
  'Connect a wallet and create a creator profile.',
  'Set up subscriptions, community access, content, or digital products.',
  'Receive USDC payments and manage fans from the ArcComm app.',
];

export function FeatureGrid() {
  return (
    <div className="px-6 pb-24">
      <div className="mx-auto max-w-6xl space-y-10">
        <section id="product" className="arc-panel arc-watermark overflow-hidden p-6 md:p-8" data-watermark="PRODUCT">
          <div className="relative z-10 space-y-8">
            <div className="max-w-3xl space-y-4">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/[0.42]">What ArcComm does</p>
              <h2 className="text-3xl font-semibold tracking-[-0.06em] text-white md:text-5xl">
                ArcComm gives creators one place to publish, charge, and manage access.
              </h2>
              <p className="arc-copy max-w-2xl">
                The platform combines creator onboarding, paid content, subscriptions, digital
                products, and member communities in one Arc-native workflow.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {productFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-[1.35rem] border border-white/[0.08] bg-black/[0.48] p-5 transition-transform duration-200 hover:-translate-y-1"
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

        <section id="experience" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="arc-panel arc-watermark p-6 md:p-8" data-watermark="ACCESS">
            <div className="relative z-10 space-y-6">
              <div className="space-y-3">
                <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/[0.42]">How it works</p>
                <h3 className="text-2xl font-semibold tracking-[-0.05em] text-white md:text-3xl">
                  ArcComm connects wallet payments directly to creator access.
                </h3>
              </div>

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
          </div>

          <div id="workflow" className="arc-panel p-6 md:p-8">
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/[0.42]">Who ArcComm is for</p>
            <div className="mt-5 space-y-4">
              {[
                'Creators who want paid subscriber access in USDC.',
                'Communities that need wallet-based paid access on Arc Testnet.',
                'Fans who want one wallet flow for subscriptions, content, and products.',
              ].map((item) => (
                <div key={item} className="rounded-[1.1rem] border border-white/[0.08] bg-black/[0.45] px-4 py-4">
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
