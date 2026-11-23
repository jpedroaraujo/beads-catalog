export const maxProductImages = 8;
export const maxImageSizeMB = 50;
export const maxImageBytes = maxImageSizeMB * 1024 * 1024;
export const maxImageAltLength = 200;
export const imageAccept = 'image/jpeg,image/png,image/webp';

export function normalizeImageAlt(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const alt = value.trim();
  return alt.length > 0 && alt.length <= maxImageAltLength ? alt : null;
}
