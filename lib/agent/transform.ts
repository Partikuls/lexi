import Anthropic from "@anthropic-ai/sdk";
import { ImageAnalysis } from "./analyzeImage";
import { buildSystemPrompt } from "./systemPrompt";
import { CourseJSON } from "@/types/course";

const MAX_RETRIES = 2;

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function callClaude(
  text: string,
  imageAnalyses: ImageAnalysis[],
  correctionHint?: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt(imageAnalyses);

  const userMessage = correctionHint
    ? `Le JSON précédent était invalide. Erreur : ${correctionHint}\n\nCorrige et renvoie le JSON complet valide pour ce cours :\n\n${text}`
    : `Transforme ce cours en JSON structuré :\n\n${text}`;

  const response = await getClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return content.text.replace(/```json|```/g, "").trim();
}

export async function transformCourse(
  text: string,
  imageAnalyses: ImageAnalysis[]
): Promise<CourseJSON> {
  let lastError: string | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const raw = await callClaude(text, imageAnalyses, lastError);

    try {
      const parsed: CourseJSON = JSON.parse(raw);

      // Merge image analyses into the course sections
      return mergeImageData(parsed, imageAnalyses);
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Invalid JSON";
      console.warn(
        `[transform] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`,
        lastError
      );

      if (attempt === MAX_RETRIES) {
        throw new Error(
          `Failed to get valid JSON after ${MAX_RETRIES + 1} attempts: ${lastError}`
        );
      }
    }
  }

  throw new Error("Unreachable");
}

/**
 * Streams the transform response via SSE.
 * Returns a ReadableStream that emits SSE events.
 */
export function transformCourseStream(
  text: string,
  imageAnalyses: ImageAnalysis[]
): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        send("status", { step: "structuring", message: "Structuration pédagogique en cours..." });

        const result = await transformCourse(text, imageAnalyses);

        send("status", { step: "complete", message: "Transformation terminée !" });
        send("result", result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        send("error", { message });
      } finally {
        controller.close();
      }
    },
  });
}

/**
 * Merge full image analysis data into the course sections.
 * The AI places images by ID and position — we enrich with full metadata.
 */
function mergeImageData(
  course: CourseJSON,
  analyses: ImageAnalysis[]
): CourseJSON {
  const analysisMap = new Map(analyses.map((a) => [a.id, a]));

  for (const section of course.sections) {
    if (!section.images) {
      section.images = [];
    }

    section.images = section.images.map((img) => {
      const analysis = analysisMap.get(img.id);
      if (!analysis) return img;

      return {
        ...img,
        url: "", // Will be filled later with Supabase URL
        type: analysis.type,
        altText: analysis.altText,
        dyslexiaCaption: analysis.dyslexiaCaption,
        keyElements: analysis.keyElements,
      };
    });
  }

  return course;
}
