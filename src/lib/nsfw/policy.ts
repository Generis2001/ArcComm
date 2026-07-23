export const NSFW_THRESHOLD = 0.55;
export const MIN_VIDEO_FRAMES = 8;

export function requiresVisualModeration(type: string): boolean {
  return type === 'VIDEO' || type === 'IMAGE_GALLERY';
}
