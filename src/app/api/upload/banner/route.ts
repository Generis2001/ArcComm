import { NextRequest } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { verifyPrivyToken } from '@/lib/privy/server';
import { toApiError } from '@/lib/utils/errors';

export const config = {
  api: { bodyParser: false },
};

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
];

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!clientPayload) throw new Error('Unauthorized');
        try {
          await verifyPrivyToken(clientPayload);
        } catch {
          throw new Error('Unauthorized');
        }

        const ext = pathname.split('.').pop()?.toLowerCase() ?? '';
        if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
          throw new Error('Only image files are allowed');
        }

        return {
          allowedContentTypes: ALLOWED_IMAGE_TYPES,
          maximumSizeInBytes: 10 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });

    return Response.json(jsonResponse);
  } catch (err) {
    return toApiError(err);
  }
}
