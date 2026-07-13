import Link from 'next/link';
import { BarChart2, DollarSign, FileText, LayoutDashboard, ShoppingBag, UserCircle, Users, Users2 } from 'lucide-react';

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
      <div className="space-y-2">
        <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/[0.40]">Creator studio</p>
        <h1 className="text-3xl font-semibold tracking-[-0.05em] text-white">Manage your revenue surface</h1>
        <p className="text-sm text-white/[0.56]">Content, products, communities, and subscriber operations in one control plane.</p>
      </div>

      <nav className="flex gap-2 overflow-x-auto rounded-full border border-white/[0.08] bg-white/[0.03] p-2">
        {studioNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/[0.54] transition-colors hover:bg-white/[0.07] hover:text-white whitespace-nowrap"
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
