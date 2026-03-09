import { NextResponse } from "next/server";
import { createServiceClient, requireAuth } from "@/lib/supabase/server";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const supabase = createServiceClient();

    const { data: courses, error } = await supabase
      .from("courses")
      .select("id, token, title, subject, level, data, created_at")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Erreur lors du chargement des cours" },
        { status: 500 }
      );
    }

    // Extract image stats from course data
    const coursesWithStats = (courses || []).map((course) => {
      const data = course.data as { sections?: { images?: { type: string }[] }[] };
      const allImages = data.sections?.flatMap((s) => s.images || []) || [];
      return {
        id: course.id,
        token: course.token,
        title: course.title,
        subject: course.subject,
        level: course.level,
        createdAt: course.created_at,
        imageStats: {
          illustrative: allImages.filter((img) => img.type === "ILLUSTRATIVE").length,
          schema: allImages.filter((img) => img.type === "SCHEMA").length,
          exercice: allImages.filter((img) => img.type === "EXERCICE").length,
          total: allImages.length,
        },
        sectionCount: data.sections?.length || 0,
      };
    });

    return NextResponse.json(coursesWithStats);
  } catch (err) {
    console.error("[courses] Error:", err);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
