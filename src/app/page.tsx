import { Hero } from '@/components/landing/Hero';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { Footer } from '@/components/landing/Footer';
import { LogoWordmark } from '@/components/ui/Logo';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/">
            <LogoWordmark size={28} />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <Hero />
        <FeatureGrid />
      </main>

      <Footer />
    </div>
  );
}
