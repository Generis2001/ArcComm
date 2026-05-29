import { ConnectButton } from '@/components/auth/ConnectButton';

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
      {/* Background gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,112,245,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-3xl space-y-8">
        <div className="inline-flex items-center rounded-full border border-arc-600/30 bg-arc-600/10 px-4 py-1.5 text-sm text-arc-400">
          Built on Arc Testnet · USDC-native
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
          Support creators.
          <br />
          <span className="text-arc-500">Own your money.</span>
        </h1>

        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          ArcCom is a wallet-native platform where fans pay creators directly in USDC —
          no banks, no intermediaries, no surprises.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <ConnectButton />
          <a
            href="#features"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Learn how it works
          </a>
          <a
            href="https://faucet.circle.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-arc-600/40 bg-arc-600/10 px-3 py-1.5 text-sm text-arc-400 hover:bg-arc-600/20 transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-arc-400" />
            Get Testnet USDC
          </a>
        </div>

        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <span>Subscriptions</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
          <span>Premium Content</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
          <span>Digital Products</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
          <span>Gated Communities</span>
        </div>
      </div>
    </section>
  );
}
