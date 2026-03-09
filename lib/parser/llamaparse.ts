import { ParseResult, ExtractedImage } from "./types";

const LLAMAPARSE_API_URL = "https://api.cloud.llamaindex.ai/api/parsing";

interface LlamaParseJob {
  id: string;
  status: string;
}

interface LlamaParseResult {
  text: string;
  images: Array<{
    name: string;
    data: string;
    type: string;
    page?: number;
    width?: number;
    height?: number;
  }>;
}

async function startJob(file: File): Promise<string> {
  const apiKey = process.env.LLAMAPARSE_API_KEY;
  if (!apiKey) throw new Error("LLAMAPARSE_API_KEY is not set");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("extract_images", "true");

  const res = await fetch(`${LLAMAPARSE_API_URL}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LlamaParse upload failed (${res.status}): ${body}`);
  }

  const job: LlamaParseJob = await res.json();
  return job.id;
}

async function pollJob(jobId: string, maxWaitMs = 90_000): Promise<void> {
  const apiKey = process.env.LLAMAPARSE_API_KEY!;
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    const res = await fetch(`${LLAMAPARSE_API_URL}/job/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) throw new Error(`LlamaParse poll failed (${res.status})`);

    const job: LlamaParseJob = await res.json();

    if (job.status === "SUCCESS") return;
    if (job.status === "ERROR") throw new Error("LlamaParse job failed");

    await new Promise((r) => setTimeout(r, 2000));
  }

  throw new Error("LlamaParse job timed out");
}

async function getResult(jobId: string): Promise<LlamaParseResult> {
  const apiKey = process.env.LLAMAPARSE_API_KEY!;

  const [textRes, imagesRes] = await Promise.all([
    fetch(`${LLAMAPARSE_API_URL}/job/${jobId}/result/text`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    }),
    fetch(`${LLAMAPARSE_API_URL}/job/${jobId}/result/images`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    }),
  ]);

  if (!textRes.ok) throw new Error(`LlamaParse text result failed (${textRes.status})`);

  const textData = await textRes.json();
  const text: string = textData.text ?? textData.markdown ?? "";

  let images: LlamaParseResult["images"] = [];
  if (imagesRes.ok) {
    const imagesData = await imagesRes.json();
    images = imagesData.images ?? imagesData ?? [];
  }

  return { text, images: Array.isArray(images) ? images : [] };
}

export async function parseLlamaParse(file: File): Promise<ParseResult> {
  const jobId = await startJob(file);
  await pollJob(jobId);
  const result = await getResult(jobId);

  const images: ExtractedImage[] = result.images.map((img, i) => ({
    id: `llama-${i}`,
    base64: img.data,
    mimeType: img.type || "image/png",
    pageNumber: img.page,
    width: img.width,
    height: img.height,
  }));

  // Replace image placeholders in text
  let text = result.text;
  result.images.forEach((img, i) => {
    if (img.name) {
      text = text.replace(img.name, `[IMAGE:llama-${i}]`);
    }
  });

  // Mark unextracted images
  text = text.replace(/!\[.*?\]\(.*?\)/g, "[IMAGE_NOT_EXTRACTED]");

  return { text, images };
}
