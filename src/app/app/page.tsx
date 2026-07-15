import Link from 'next/link';
import { BookMarked, Clapperboard, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const quickActions = [
  {
    href: '/app/explore',
    icon: Compass,
    title: 'Explore creators',
    description: 'Browse creator profiles, subscription tiers, and premium content.',
  },
  {
    href: '/app/dashboard/subscriptions',
    icon: BookMarked,
    title: 'Subscriptions',
    description: 'Review your active subscriptions and the access they unlock.',
  },
  {
    href: '/app/studio',
    icon: Clapperboard,
    title: 'Creator studio',
    description: 'Publish content, set prices, and manage your creator profile.',
  },
];

export default function AppHomePage() {
  return (
    <div className="space-y-6">
      <section className="arc-panel arc-watermark overflow-hidden p-6 md:p-8" data-watermark="HOME">
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/[0.40]">ArcComm home</p>
            <h1 className="text-3xl font-semibold tracking-[-0.06em] text-white md:text-5xl">
              Manage subscriptions, access, and creator tools.
            </h1>
            <p className="arc-copy max-w-xl">
              Use ArcComm to follow creators, unlock paid content, join communities, or manage your
              own profile and products on Arc Testnet.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/app/communities">Communities</Link>
            </Button>
            <Button variant="arc" asChild>
              <Link href="/app/explore">Explore creators</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="h-full border-white/[0.10] bg-white/[0.03] transition-transform duration-200 hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-2 inline-flex w-fit rounded-full border border-white/[0.10] bg-white/[0.05] p-3">
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-white/[0.56]">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
