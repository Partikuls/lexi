import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, sectionId, action, data } = body as {
      courseId: string;
      sectionId?: number;
      action: string;
      data?: Record<string, unknown>;
    };

    if (!courseId || !action) {
      return NextResponse.json(
        { error: "courseId et action sont requis" },
        { status: 400 }
      );
    }

    // For now, just log sessions. A dedicated sessions table can be added later.
    console.log("[session]", { courseId, sectionId, action, data });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[session] Error:", err);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
