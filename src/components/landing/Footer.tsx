export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm font-semibold text-foreground">ArcCom</p>
        <p className="text-xs text-muted-foreground">
          Built on Arc Testnet · Payments in USDC · No fiat, no banks
        </p>
      </div>
    </footer>
  );
}
