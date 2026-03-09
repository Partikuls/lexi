import sharp from "sharp";
import { createServerClient } from "@/lib/supabase/server";
import { ExtractedImage } from "@/lib/parser/types";

const BUCKET = "course-images";

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB || "20", 10)) * 1024 * 1024;

interface UploadedImage {
  id: string;
  storagePath: string;
  publicUrl: string;
}

function validateImage(image: ExtractedImage): void {
  if (!ALLOWED_MIME_TYPES.has(image.mimeType)) {
    throw new Error(`Unsupported image type: ${image.mimeType}`);
  }

  const sizeBytes = Math.ceil(image.base64.length * 0.75);
  if (sizeBytes > MAX_FILE_SIZE) {
    throw new Error(`Image ${image.id} exceeds max file size`);
  }
}

async function convertToWebP(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer).webp({ quality: 80 }).toBuffer();
}

export async function uploadImage(
  courseId: string,
  image: ExtractedImage
): Promise<UploadedImage> {
  validateImage(image);

  const supabase = createServerClient();
  const rawBuffer = Buffer.from(image.base64, "base64");

  // Convert to WebP for smaller file sizes (skip if already webp or gif)
  let buffer: Buffer;
  let contentType: string;
  let ext: string;

  if (image.mimeType === "image/gif") {
    buffer = rawBuffer;
    contentType = "image/gif";
    ext = "gif";
  } else if (image.mimeType === "image/webp") {
    buffer = rawBuffer;
    contentType = "image/webp";
    ext = "webp";
  } else {
    buffer = await convertToWebP(rawBuffer);
    contentType = "image/webp";
    ext = "webp";
  }

  const storagePath = `${courseId}/${image.id}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload image ${image.id}: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return {
    id: image.id,
    storagePath,
    publicUrl: urlData.publicUrl,
  };
}

export async function uploadImages(
  courseId: string,
  images: ExtractedImage[]
): Promise<UploadedImage[]> {
  const maxImages = parseInt(process.env.MAX_IMAGES_PER_COURSE || "20", 10);
  const toUpload = images.slice(0, maxImages);

  const results = await Promise.all(
    toUpload.map((img) =>
      uploadImage(courseId, img).catch((err) => {
        console.error(`[storage] Failed to upload ${img.id}:`, err);
        return null;
      })
    )
  );

  return results.filter((r): r is UploadedImage => r !== null);
}
