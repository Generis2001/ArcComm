import type { VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'npm run build',
  crons: [
    { path: '/api/cron/tx-indexer', schedule: '0 0 * * *' },
    { path: '/api/cron/settlement', schedule: '0 1 * * *' },
    { path: '/api/cron/payout-processor', schedule: '0 3 * * *' },
    { path: '/api/cron/subscriptions', schedule: '0 2 * * *' },
    { path: '/api/cron/community-distribution', schedule: '0 0 * * 0' },
  ],
};
