import Link from 'next/link';
import { BookMarked, Clapperboard, Compass, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const quickActions = [
  {
    href: '/app/explore',
    icon: Compass,
    title: 'Explore creators',
    description: 'Scan active creator profiles, tiers, and premium content surfaces.',
  },
  {
    href: '/app/dashboard/subscriptions',
    icon: BookMarked,
    title: 'Manage subscriptions',
    description: 'Track your recurring support and any gated access tied to it.',
  },
  {
    href: '/app/studio',
    icon: Clapperboard,
    title: 'Open creator studio',
    description: 'Publish content, price access, and manage revenue operations.',
  },
];

export default function AppHomePage() {
  return (
    <div className="space-y-6">
      <section className="arc-panel arc-watermark overflow-hidden p-6 md:p-8" data-watermark="CONTROL">
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/[0.40]">Dashboard</p>
            <h1 className="text-3xl font-semibold tracking-[-0.06em] text-white md:text-5xl">
              Welcome to ArcComm.
            </h1>
            <p className="arc-copy max-w-xl">
              Support creators, unlock premium access, and operate creator revenue in a cleaner
              black-and-white shell built for Arc Testnet.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/app/communities">View communities</Link>
            </Button>
            <Button variant="arc" asChild>
              <Link href="/app/explore">Discover creators</Link>
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

        <Card className="border-white/[0.10] bg-black/[0.55]">
          <CardHeader>
            <div className="mb-3 inline-flex w-fit rounded-full border border-white/[0.10] bg-white/[0.05] p-3">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg">Revenue posture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-white/[0.58]">
            <p>Subscriptions, communities, and store purchases all settle through the same ArcComm rail.</p>
            <p>Use the creator studio when you want to turn your profile into a live monetization surface.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
