import { NextRequest } from "next/server";
import { transformCourseStream } from "@/lib/agent/transform";
import { ImageAnalysis } from "@/lib/agent/analyzeImage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, imageAnalyses } = body as {
      text: string;
      imageAnalyses: ImageAnalysis[];
    };

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ error: "Aucun texte à transformer" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = transformCourseStream(text, imageAnalyses || []);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[transform] Error:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
