import Link from 'next/link';
import { BarChart2, DollarSign, FileText, LayoutDashboard, ShoppingBag, Users, UserCircle, Users2 } from 'lucide-react';

const studioNav = [
  { href: '/app/studio', icon: LayoutDashboard, label: 'Overview' },
  { href: '/app/studio/earnings', icon: DollarSign, label: 'Earnings' },
  { href: '/app/studio/content', icon: FileText, label: 'Content' },
  { href: '/app/studio/store', icon: ShoppingBag, label: 'Store' },
  { href: '/app/studio/subscribers', icon: Users, label: 'Subscribers' },
  { href: '/app/studio/communities', icon: Users2, label: 'Communities' },
  { href: '/app/studio/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/app/studio/profile', icon: UserCircle, label: 'Profile' },
];

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Creator Studio</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your content and earnings</p>
      </div>

      <nav className="flex gap-1 border-b border-border pb-0 overflow-x-auto">
        {studioNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground whitespace-nowrap border-b-2 border-transparent hover:border-arc-600/50 transition-colors"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div>{children}</div>
    </div>
  );
}
