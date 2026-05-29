import { PrivyClient } from '@privy-io/server-auth';
import { type NextRequest } from 'next/server';

const globalForPrivy = globalThis as unknown as {
  privyClient: PrivyClient | undefined;
};

export const privyServer =
  globalForPrivy.privyClient ??
  new PrivyClient(
    process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
    process.env.PRIVY_APP_SECRET!,
  );

if (process.env.NODE_ENV !== 'production') {
  globalForPrivy.privyClient = privyServer;
}

export async function verifyPrivyToken(token: string) {
  return privyServer.verifyAuthToken(token);
}

export async function getPrivyUserFromRequest(req: NextRequest) {
  const token =
    req.cookies.get('privy-token')?.value ??
    req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) return null;

  try {
    const claims = await verifyPrivyToken(token);
    return claims;
  } catch {
    return null;
  }
}

// Call this at the top of every protected API route handler.
// Throws a Response with 401 if unauthenticated.
export async function requireAuth(req: NextRequest) {
  const claims = await getPrivyUserFromRequest(req);
  if (!claims) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return claims;
}
