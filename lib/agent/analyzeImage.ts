import Anthropic from "@anthropic-ai/sdk";
import { ExtractedImage } from "@/lib/parser/types";
import { ImageType } from "@/types/course";

const VISION_SYSTEM_PROMPT = `Tu es un expert en pédagogie et accessibilité. Tu analyses des images extraites de documents scolaires.

Pour chaque image, tu dois produire un JSON strict avec :
- "type": "ILLUSTRATIVE" | "SCHEMA" | "EXERCICE"
  - ILLUSTRATIVE : photo, illustration décorative, portrait
  - SCHEMA : diagramme, carte, graphique, tableau, schéma scientifique
  - EXERCICE : consigne d'exercice, QCM, texte à trous, image nécessaire pour répondre à une question
- "altText": description concise pour les lecteurs d'écran (1-2 phrases, en français)
- "dyslexiaCaption": légende simplifiée pour le mode dyslexie (max 15 mots, langage simple)
- "keyElements": tableau de 2-5 éléments clés visibles dans l'image (pour SCHEMA et EXERCICE surtout)
- "linkedQuestion": si l'image est liée à un exercice, reformuler la question en texte (sinon null)

RÈGLES :
- Répondre UNIQUEMENT avec du JSON valide
- Pas de markdown, pas de backticks
- Si l'image est floue ou illisible, mettre type "ILLUSTRATIVE" et le signaler dans altText`;

export interface ImageAnalysis {
  id: string;
  type: ImageType;
  altText: string;
  dyslexiaCaption: string;
  keyElements: string[];
  linkedQuestion: string | null;
}

const client = new Anthropic();

async function analyzeOne(image: ExtractedImage): Promise<ImageAnalysis> {
  // Low-res images default to ILLUSTRATIVE
  if (image.width && image.height && image.width < 100 && image.height < 100) {
    return {
      id: image.id,
      type: "ILLUSTRATIVE",
      altText: "Image de petite taille, probablement un icône ou élément décoratif.",
      dyslexiaCaption: "Petite image décorative.",
      keyElements: [],
      linkedQuestion: null,
    };
  }

  const mediaType = image.mimeType === "image/jpeg" ? "image/jpeg"
    : image.mimeType === "image/gif" ? "image/gif"
    : image.mimeType === "image/webp" ? "image/webp"
    : "image/png";

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: VISION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: image.base64,
            },
          },
          {
            type: "text",
            text: "Analyse cette image extraite d'un document scolaire. Réponds en JSON uniquement.",
          },
        ],
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "";
  const clean = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(clean);
    return {
      id: image.id,
      type: parsed.type || "ILLUSTRATIVE",
      altText: parsed.altText || "Image sans description disponible.",
      dyslexiaCaption: parsed.dyslexiaCaption || "Image du cours.",
      keyElements: parsed.keyElements || [],
      linkedQuestion: parsed.linkedQuestion || null,
    };
  } catch {
    console.error(`[vision] Failed to parse JSON for image ${image.id}:`, clean);
    return {
      id: image.id,
      type: "ILLUSTRATIVE",
      altText: "Image non analysée — erreur de traitement.",
      dyslexiaCaption: "Image du cours.",
      keyElements: [],
      linkedQuestion: null,
    };
  }
}

export async function analyzeImages(
  images: ExtractedImage[]
): Promise<ImageAnalysis[]> {
  const batchSize = parseInt(process.env.IMAGE_ANALYSIS_BATCH_SIZE || "3", 10);
  const results: ImageAnalysis[] = [];

  // Prioritize SCHEMA and EXERCICE-likely images (larger images first)
  const sorted = [...images].sort((a, b) => {
    const sizeA = (a.width || 0) * (a.height || 0);
    const sizeB = (b.width || 0) * (b.height || 0);
    return sizeB - sizeA;
  });

  for (let i = 0; i < sorted.length; i += batchSize) {
    const batch = sorted.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(analyzeOne));
    results.push(...batchResults);
  }

  return results;
}
