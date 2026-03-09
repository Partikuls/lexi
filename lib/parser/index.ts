import { ParseResult } from "./types";
import { parseLlamaParse } from "./llamaparse";
import { parseDocx } from "./docx";

export type { ParseResult, ExtractedImage } from "./types";

const SUPPORTED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

const DOCX_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

export function isSupportedFile(mimeType: string): boolean {
  return SUPPORTED_TYPES.has(mimeType);
}

export async function parseDocument(file: File): Promise<ParseResult> {
  const hasLlamaParse = !!process.env.LLAMAPARSE_API_KEY;

  // PDFs always go through LlamaParse
  if (file.type === "application/pdf") {
    if (!hasLlamaParse) {
      throw new Error("PDF parsing requires LLAMAPARSE_API_KEY");
    }
    return parseLlamaParse(file);
  }

  // DOCX: try LlamaParse first (better image extraction), fall back to Mammoth
  if (DOCX_TYPES.has(file.type)) {
    if (hasLlamaParse) {
      try {
        return await parseLlamaParse(file);
      } catch (err) {
        console.warn("[parser] LlamaParse failed for docx, falling back to Mammoth:", err);
      }
    }
    const buffer = await file.arrayBuffer();
    return parseDocx(buffer);
  }

  throw new Error(`Unsupported file type: ${file.type}`);
}
