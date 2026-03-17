import imageCompression from "browser-image-compression";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_ORIGINAL_SIZE = 18 * 1024 * 1024; // 18 MB

export function validateImageFile(
  file: File,
): { valid: true } | { valid: false; error: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Only JPEG, PNG, and WebP images are accepted" };
  }
  if (file.size > MAX_ORIGINAL_SIZE) {
    return { valid: false, error: "Image must be under 18 MB" };
  }
  return { valid: true };
}

export async function compressImage(
  file: File,
  options?: { maxSizeMB?: number; maxWidthOrHeight?: number },
): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: options?.maxSizeMB ?? 4,
    maxWidthOrHeight: options?.maxWidthOrHeight ?? 1920,
    useWebWorker: true,
    initialQuality: 0.8,
  });
}
