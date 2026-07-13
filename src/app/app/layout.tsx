import Link from 'next/link';
import { BookMarked, Clapperboard, Compass, LayoutDashboard, Store, Users2 } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ChainGuard } from '@/components/auth/ChainGuard';
import { CreatorGuard } from '@/components/app/CreatorGuard';
import { SidebarFooter } from '@/components/app/SidebarFooter';
import { ArcSymbolBadge, ArcWordmark } from '@/components/ui/ArcBadge';
import { LogoWordmark } from '@/components/ui/Logo';

const navItems = [
  { href: '/app', icon: LayoutDashboard, label: 'Home' },
  { href: '/app/explore', icon: Compass, label: 'Explore' },
  { href: '/app/dashboard/subscriptions', icon: BookMarked, label: 'Subscriptions' },
  { href: '/app/dashboard/purchases', icon: Store, label: 'Purchases' },
  { href: '/app/communities', icon: Users2, label: 'Communities' },
  { href: '/app/studio', icon: Clapperboard, label: 'Creator Studio' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <ChainGuard>
        <CreatorGuard>
          <div className="arc-shell min-h-screen">
            <div className="mx-auto flex min-h-screen max-w-[1500px]">
              <aside className="sticky top-0 hidden h-screen w-[296px] shrink-0 border-r border-white/[0.08] bg-black/[0.45] px-5 py-6 md:flex md:flex-col">
                <Link href="/app" className="block px-1">
                  <LogoWordmark size={28} />
                </Link>

                <div className="mt-8 rounded-[1.5rem] border border-white/[0.10] bg-white/[0.03] p-4">
                  <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/[0.38]">ArcComm app</p>
                  <p className="mt-3 text-sm leading-6 text-white/[0.68]">
                    Manage creator profiles, subscriptions, communities, and digital products on Arc Testnet.
                  </p>
                </div>

                <nav className="mt-6 flex-1 space-y-1.5">
                  {navItems.map((item) => (
                    <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} />
                  ))}
                </nav>

                <div className="space-y-4">
                  <div className="rounded-[1.35rem] border border-white/[0.10] bg-white/[0.03] px-4 py-3">
                    <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/[0.38]">Built on</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <ArcWordmark className="h-4" />
                      <ArcSymbolBadge className="h-8 w-8" />
                    </div>
                  </div>
                  <SidebarFooter />
                </div>
              </aside>

              <div className="flex min-h-screen flex-1 flex-col">
                <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-black/[0.72] backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.22em] text-white/[0.36]">ArcComm</p>
                      <p className="mt-1 text-sm text-white/[0.62]">Subscriptions, access, and creator management on Arc Testnet.</p>
                    </div>
                    <ArcSymbolBadge />
                  </div>
                  <div className="flex gap-2 overflow-x-auto px-4 pb-4 md:hidden">
                    {navItems.map((item) => (
                      <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} mobile />
                    ))}
                  </div>
                </header>

                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                  <div className="mx-auto max-w-6xl">
                    <div className="mb-6 md:hidden">
                      <SidebarFooter compact />
                    </div>
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </div>
        </CreatorGuard>
      </ChainGuard>
    </AuthGuard>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  mobile = false,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  mobile?: boolean;
}) {
  return (
    <Link
      href={href}
      className={mobile
        ? 'inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-xs text-white/[0.64] transition-colors hover:bg-white/[0.08] hover:text-white'
        : 'flex items-center gap-3 rounded-[1rem] border border-transparent px-3 py-3 text-sm text-white/[0.56] transition-colors hover:border-white/[0.10] hover:bg-white/[0.05] hover:text-white'}
    >
      <Icon className={mobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      {label}
    </Link>
  );
}
