"use client";

import { useState, useEffect } from "react";
import { CourseJSON } from "@/types/course";
import CourseViewer from "@/components/course/CourseViewer";

export default function CoursePage({
  params,
}: {
  params: { token: string };
}) {
  const [course, setCourse] = useState<CourseJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/course/${params.token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setCourse(data.data || data);
        }
      })
      .catch(() => setError("Erreur de chargement du cours"))
      .finally(() => setLoading(false));
  }, [params.token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F13] flex items-center justify-center">
        <div className="text-[#7C7C8A] animate-pulse">Chargement du cours...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#0F0F13] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#FCA5A5] mb-4">{error || "Cours introuvable"}</div>
          <a href="/upload" className="text-[#E8521A] underline">
            Retour
          </a>
        </div>
      </div>
    );
  }

  return <CourseViewer course={course} />;
}
