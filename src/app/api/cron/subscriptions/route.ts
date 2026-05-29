import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';

const GRACE_PERIOD_HOURS = 48;

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '');
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  // Mark subscriptions past their end date + grace period as EXPIRED
  const expired = await prisma.subscription.updateMany({
    where: {
      status: { in: ['ACTIVE', 'PAST_DUE'] },
      currentPeriodEnd: {
        lt: new Date(now.getTime() - GRACE_PERIOD_HOURS * 60 * 60 * 1000),
      },
    },
    data: { status: 'EXPIRED' },
  });

  // Mark subscriptions just past their end date as PAST_DUE (within grace period)
  const pastDue = await prisma.subscription.updateMany({
    where: {
      status: 'ACTIVE',
      currentPeriodEnd: { lt: now },
    },
    data: { status: 'PAST_DUE' },
  });

  console.log(`[cron:subscriptions] expired=${expired.count} past_due=${pastDue.count}`);

  return Response.json({
    ok: true,
    expired: expired.count,
    pastDue: pastDue.count,
  });
}
