import { NextRequest } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { verifyPrivyToken } from '@/lib/privy/server';
import { toApiError } from '@/lib/utils/errors';

// Disable Next.js body size limit — this route receives Vercel Blob callbacks
export const config = {
  api: { bodyParser: false },
};

const ALLOWED_EXTS = [
  'mp4', 'mov', 'webm', 'mkv',
  'mp3', 'wav', 'ogg', 'm4a', 'flac',
  'jpg', 'jpeg', 'png', 'gif', 'webp',
  'pdf', 'zip', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv',
];
const MAX_BYTES = 32 * 1024 * 1024;

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
        if (!ALLOWED_EXTS.includes(ext)) {
          throw new Error(`File type .${ext} is not allowed`);
        }

        return {
          allowedContentTypes: [
            'video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska',
            'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac',
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/zip',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain', 'text/csv',
          ],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
        };
      },
      // No onUploadCompleted — client receives the blob URL directly from upload()
    });

    return Response.json(jsonResponse);
  } catch (err) {
    return toApiError(err);
  }
}
