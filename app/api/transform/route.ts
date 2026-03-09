import { NextRequest } from "next/server";
import { transformCourse } from "@/lib/agent/transform";
import { ImageAnalysis } from "@/lib/agent/analyzeImage";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, imageAnalyses, courseId } = body as {
      text: string;
      imageAnalyses: ImageAnalysis[];
      courseId?: string;
    };

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ error: "Aucun texte à transformer" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        };

        try {
          send("status", { step: "structuring", message: "Structuration pédagogique en cours..." });

          const result = await transformCourse(text, imageAnalyses || []);

          send("status", { step: "complete", message: "Transformation terminée !" });

          // Save to DB if courseId provided
          let token: string | null = null;
          if (courseId) {
            const supabase = createServerClient();
            const { data: updated, error: dbError } = await supabase
              .from("courses")
              .update({
                title: result.title,
                subject: result.subject,
                level: result.level,
                data: result,
              })
              .eq("id", courseId)
              .select("token")
              .single();

            if (dbError) {
              console.error("[transform] DB update failed:", dbError);
            } else {
              token = updated?.token || null;
            }
          }

          send("result", { ...result, token });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Erreur inconnue";
          send("error", { message });
        } finally {
          controller.close();
        }
      },
    });

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
