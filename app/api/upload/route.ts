import { NextRequest, NextResponse } from "next/server";
import { parseDocument, isSupportedFile } from "@/lib/parser";
import { uploadImages } from "@/lib/storage/images";
import { createServerClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    if (!isSupportedFile(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Utilisez un fichier Word (.docx) ou PDF." },
        { status: 400 }
      );
    }

    const maxSize = parseInt(process.env.MAX_FILE_SIZE_MB || "20", 10) * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (max ${process.env.MAX_FILE_SIZE_MB || 20} Mo)` },
        { status: 400 }
      );
    }

    // Parse the document
    const { text, images } = await parseDocument(file);

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Aucun texte extrait du document" },
        { status: 400 }
      );
    }

    // Generate a course ID for storage
    const courseId = randomUUID();

    // Upload images to Supabase Storage
    const uploadedImages = await uploadImages(courseId, images);

    // Create a map of image ID → public URL
    const imageUrls = new Map(uploadedImages.map((img) => [img.id, img.publicUrl]));

    // Store course draft in Supabase
    const supabase = createServerClient();
    const { error: dbError } = await supabase.from("courses").insert({
      id: courseId,
      title: file.name.replace(/\.\w+$/, ""),
      subject: "",
      level: "",
      data: {},
    });

    if (dbError) {
      console.error("[upload] DB insert failed:", dbError);
    }

    // Store image records
    for (const img of uploadedImages) {
      const analysis = images.find((i) => i.id === img.id);
      await supabase.from("course_images").insert({
        course_id: courseId,
        storage_path: img.storagePath,
        public_url: img.publicUrl,
        type: "ILLUSTRATIVE",
        alt_text: analysis ? `Image ${analysis.id}` : "",
      });
    }

    return NextResponse.json({
      courseId,
      text,
      images: images.map((img) => ({
        id: img.id,
        mimeType: img.mimeType,
        base64: img.base64,
        publicUrl: imageUrls.get(img.id) || null,
        width: img.width,
        height: img.height,
      })),
      imageCount: images.length,
    });
  } catch (err) {
    console.error("[upload] Error:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
