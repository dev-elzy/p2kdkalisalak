/**
 * image-compressor.ts
 * Utility kompresi & resize gambar foto profil / pasfoto di sisi client
 * Mengubah foto kamera / berkas (hingga ukuran besar) menjadi format WebP/JPEG berkualitas tinggi berukuran kecil (30KB - 80KB)
 * agar tersimpan permanen & instan ke database Supabase Cloud tanpa kendala payload.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: "image/webp" | "image/jpeg";
}

export async function compressImage(
  file: File | Blob,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 480,
    maxHeight = 640,
    quality = 0.82,
    mimeType = "image/webp",
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressedBase64 = canvas.toDataURL(mimeType, quality);
          resolve(compressedBase64);
        } catch {
          // Fallback to JPEG if WebP not supported
          const fallbackBase64 = canvas.toDataURL("image/jpeg", quality);
          resolve(fallbackBase64);
        }
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}
