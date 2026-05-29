// Client-only — do not import from server components or API routes
import * as nsfwjs from 'nsfwjs';

let modelPromise: Promise<nsfwjs.NSFWJS> | null = null;

export function getNsfwModel(): Promise<nsfwjs.NSFWJS> {
  if (!modelPromise) {
    modelPromise = nsfwjs.load();
  }
  return modelPromise;
}

const NSFW_CATEGORIES = ['Porn', 'Sexy', 'Hentai'];
const NSFW_THRESHOLD = 0.6;

export async function scanImage(
  element: HTMLImageElement | HTMLCanvasElement,
): Promise<{ isNsfw: boolean; score: number }> {
  const model = await getNsfwModel();
  const predictions = await model.classify(element as HTMLImageElement);
  const score = predictions
    .filter((p) => NSFW_CATEGORIES.includes(p.className))
    .reduce((sum, p) => sum + p.probability, 0);
  return { isNsfw: score > NSFW_THRESHOLD, score };
}

export function extractVideoFrame(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, video.duration / 2);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 224;
      canvas.height = video.videoHeight || 224;
      canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video for scanning'));
    };
  });
}
