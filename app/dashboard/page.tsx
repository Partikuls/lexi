"use client";

import { useState, useEffect } from "react";

interface CourseCard {
  id: string;
  token: string;
  title: string;
  subject: string;
  level: string;
  createdAt: string;
  imageStats: {
    illustrative: number;
    schema: number;
    exercice: number;
    total: number;
  };
  sectionCount: number;
}

export default function DashboardPage() {
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setCourses(data);
        }
      })
      .catch(() => setError("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/course/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F13] flex items-center justify-center">
        <div className="text-[#7C7C8A] animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F13] to-[#1A1028] p-4 md:p-8 font-serif">
      {/* Header */}
      <div className="max-w-[960px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8521A] to-[#F4A261] flex items-center justify-center text-xl font-black text-white">
              L
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#F0EDE8]">Mes cours</h1>
              <p className="text-xs text-[#7C7C8A]">
                {courses.length} cours créé{courses.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <a
            href="/upload"
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#E8521A] to-[#F4A261] text-white text-sm font-bold min-h-[44px] flex items-center hover:opacity-90 transition-opacity"
          >
            + Nouveau cours
          </a>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#2A1010] border border-[#7F1D1D] text-[#FCA5A5] text-sm">
            {error}
          </div>
        )}

        {courses.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 opacity-30">📚</div>
            <p className="text-[#7C7C8A] mb-4">Aucun cours pour le moment</p>
            <a
              href="/upload"
              className="text-[#E8521A] underline text-sm"
            >
              Créer votre premier cours
            </a>
          </div>
        )}

        {/* Course grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-[#16161E] rounded-xl border border-[#2A2A35] p-5 hover:border-[#3A3A45] transition-colors"
            >
              {/* Title + meta */}
              <div className="mb-3">
                <h2 className="text-[#F0EDE8] font-bold text-base leading-snug mb-1 line-clamp-2">
                  {course.title}
                </h2>
                <div className="text-[11px] text-[#7C7C8A]">
                  {course.subject && <span>{course.subject}</span>}
                  {course.level && <span> · {course.level}</span>}
                  <span> · {course.sectionCount} sections</span>
                </div>
              </div>

              {/* Image stats */}
              {course.imageStats.total > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {course.imageStats.illustrative > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-[#1E1E28] text-[11px] text-[#7C7C8A]">
                      🖼 {course.imageStats.illustrative} illustr.
                    </span>
                  )}
                  {course.imageStats.schema > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-[#1E1E28] text-[11px] text-[#7C7C8A]">
                      📊 {course.imageStats.schema} schéma{course.imageStats.schema > 1 ? "s" : ""}
                    </span>
                  )}
                  {course.imageStats.exercice > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-[#1E1E28] text-[11px] text-[#7C7C8A]">
                      ✏️ {course.imageStats.exercice} exercice{course.imageStats.exercice > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}

              {/* Date */}
              <div className="text-[11px] text-[#4A4A55] mb-3">
                {new Date(course.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <a
                  href={`/course/${course.token}`}
                  className="flex-1 text-center py-2 rounded-lg bg-[#2A2A35] text-[#F0EDE8] text-xs font-bold min-h-[44px] flex items-center justify-center hover:bg-[#3A3A45] transition-colors"
                >
                  Voir le cours
                </a>
                <button
                  onClick={() => copyLink(course.token)}
                  className="flex-1 py-2 rounded-lg border border-[#2A2A35] text-xs font-bold min-h-[44px] flex items-center justify-center hover:bg-[#1E1E28] transition-colors"
                  style={{
                    color: copied === course.token ? "#059669" : "#7C7C8A",
                    borderColor: copied === course.token ? "#059669" : undefined,
                  }}
                >
                  {copied === course.token ? "✓ Lien copié !" : "📋 Copier le lien"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
