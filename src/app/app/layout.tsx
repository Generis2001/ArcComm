import { AuthGuard } from '@/components/auth/AuthGuard';
import { ChainGuard } from '@/components/auth/ChainGuard';
import { SidebarFooter } from '@/components/app/SidebarFooter';
import { LogoWordmark } from '@/components/ui/Logo';
import Link from 'next/link';
import { LayoutDashboard, Compass, BookMarked, Store, Clapperboard, Users2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <ChainGuard>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card px-4 py-6 shrink-0">
            <Link href="/app" className="mb-8 px-2 block">
              <LogoWordmark size={26} />
            </Link>

            <nav className="flex-1 space-y-1">
              <NavItem href="/app" icon={LayoutDashboard} label="Home" />
              <NavItem href="/app/explore" icon={Compass} label="Explore" />
              <NavItem href="/app/dashboard/subscriptions" icon={BookMarked} label="Subscriptions" />
              <NavItem href="/app/dashboard/purchases" icon={Store} label="Purchases" />
              <NavItem href="/app/communities" icon={Users2} label="Communities" />
              <NavItem href="/app/studio" icon={Clapperboard} label="Creator Studio" />
            </nav>

            <SidebarFooter />
          </aside>

          {/* Main */}
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-5xl px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </ChainGuard>
    </AuthGuard>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
