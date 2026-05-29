import { NextRequest } from 'next/server';
import { runSettlement } from '@/lib/payments/settlement';

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '');
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { settled } = await runSettlement();
    console.log(`[cron:settlement] Settled ${settled} payments`);
    return Response.json({ ok: true, settled });
  } catch (err) {
    console.error('[cron:settlement] Error:', err);
    return Response.json({ error: 'Settlement failed' }, { status: 500 });
  }
}
