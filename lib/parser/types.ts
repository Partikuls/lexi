export interface ExtractedImage {
  id: string;
  base64: string;
  mimeType: string;
  pageNumber?: number;
  width?: number;
  height?: number;
}

export interface ParseResult {
  text: string;
  images: ExtractedImage[];
}
