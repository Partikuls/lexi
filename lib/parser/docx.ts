import mammoth from "mammoth";
import { ParseResult, ExtractedImage } from "./types";

export async function parseDocx(buffer: ArrayBuffer): Promise<ParseResult> {
  const images: ExtractedImage[] = [];
  let imageCounter = 0;

  const result = await mammoth.convertToHtml(
    { arrayBuffer: buffer },
    {
      convertImage: mammoth.images.imgElement((image) => {
        const id = `docx-${imageCounter++}`;
        return image.read("base64").then((base64Data) => {
          images.push({
            id,
            base64: base64Data,
            mimeType: image.contentType || "image/png",
          });
          return { src: `[IMAGE:${id}]` };
        });
      }),
    }
  );

  // Strip HTML tags to get plain text, preserve image markers
  const text = result.value
    .replace(/<img[^>]*src="(\[IMAGE:[^"]+\])"[^>]*>/g, "\n$1\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Log warnings from mammoth
  if (result.messages.length > 0) {
    console.warn(
      "[docx parser] warnings:",
      result.messages.map((m) => m.message)
    );
  }

  return { text, images };
}
