import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createServiceClient();

    const { data: course, error } = await supabase
      .from("courses")
      .select("*")
      .eq("token", params.token)
      .single();

    if (error || !course) {
      return NextResponse.json(
        { error: "Cours introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (err) {
    console.error("[course] Error:", err);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
