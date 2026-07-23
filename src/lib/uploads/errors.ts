export const PROHIBITED_CONTENT_MESSAGE =
  'This content is prohibited on Cohora. NSFW or sexually explicit uploads are not allowed.';

export const MODERATION_UNAVAILABLE_MESSAGE =
  'Cohora could not complete the required safety scan. The file was not uploaded. Please try again.';

export function getUploadErrorMessage(error: unknown, fallback = 'Upload failed.'): string {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const normalizedMessage = message.toLowerCase();
  const isClientTokenFailure =
    normalizedMessage.includes('failed to retrieve the client token') ||
    (normalizedMessage.includes('vercel blob') && normalizedMessage.includes('client token'));

  return isClientTokenFailure ? PROHIBITED_CONTENT_MESSAGE : message || fallback;
}
