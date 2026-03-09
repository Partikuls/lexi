import { NextRequest, NextResponse } from "next/server";
import { analyzeImages } from "@/lib/agent/analyzeImage";
import { ExtractedImage } from "@/lib/parser/types";
import { requireAuth } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { images } = body as { images: ExtractedImage[] };

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Aucune image à analyser" },
        { status: 400 }
      );
    }

    const analyses = await analyzeImages(images);

    return NextResponse.json({ analyses });
  } catch (err) {
    console.error("[analyze-images] Error:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
