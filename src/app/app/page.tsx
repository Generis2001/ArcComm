import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, BookMarked, Clapperboard } from 'lucide-react';

export default function AppHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome to ArcCom</h1>
        <p className="text-muted-foreground mt-1">
          Support creators, access exclusive content, and earn in USDC.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickAction
          href="/app/explore"
          icon={Compass}
          title="Explore"
          description="Discover creators on ArcCom"
        />
        <QuickAction
          href="/app/dashboard/subscriptions"
          icon={BookMarked}
          title="My Subscriptions"
          description="Manage your active subscriptions"
        />
        <QuickAction
          href="/app/studio"
          icon={Clapperboard}
          title="Creator Studio"
          description="Manage your creator profile"
        />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:border-arc-600/40 transition-colors h-full">
        <CardHeader>
          <div className="inline-flex rounded-lg bg-arc-600/10 p-2.5 w-fit mb-2">
            <Icon className="h-5 w-5 text-arc-400" />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
