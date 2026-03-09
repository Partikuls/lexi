"use client";

import { useState, useEffect } from "react";
import { CourseJSON } from "@/types/course";

export default function CoursePage({
  params,
}: {
  params: { token: string };
}) {
  const [course, setCourse] = useState<CourseJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [quizState, setQuizState] = useState<Record<string, { answered: boolean; selected: number; correct: boolean }>>({});

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
          <a href="/upload" className="text-[#E8521A] underline">Retour</a>
        </div>
      </div>
    );
  }

  const section = course.sections[activeSection];

  const handleQuiz = (sectionId: number, qi: number, ansIdx: number) => {
    const key = `${sectionId}-${qi}`;
    if (quizState[key]?.answered) return;
    setQuizState((prev) => ({
      ...prev,
      [key]: { answered: true, selected: ansIdx, correct: ansIdx === section.quiz[qi].answer },
    }));
  };

  const bg = dyslexiaMode ? "bg-[#FFF8F0]" : "bg-[#0F0F13]";
  const textColor = dyslexiaMode ? "text-[#1a1a2e]" : "text-[#F0EDE8]";

  return (
    <div className={`min-h-screen ${bg} ${textColor} transition-all duration-400`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 px-5 h-[60px] flex items-center justify-between ${
        dyslexiaMode ? "bg-white border-b-[3px] border-[#FFD166] shadow-sm" : "bg-[#1A1A22] border-b border-[#2A2A35] shadow-[0_2px_20px_rgba(0,0,0,0.4)]"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8521A] to-[#F4A261] flex items-center justify-center text-base font-black text-white">L</div>
          <div>
            <div className="font-bold text-sm">{course.title}</div>
            <div className="text-[11px] opacity-50">{course.subject} · {course.level}</div>
          </div>
        </div>
        <button
          onClick={() => setDyslexiaMode((d) => !d)}
          className={`px-3.5 py-1.5 rounded-full text-white text-xs font-bold ${
            dyslexiaMode ? "bg-[#059669] shadow-[0_0_12px_rgba(5,150,105,0.35)]" : "bg-[#E8521A] shadow-[0_0_12px_rgba(232,82,26,0.35)]"
          }`}
        >
          {dyslexiaMode ? "✓ Dyslexie ON" : "Mode dyslexie"}
        </button>
      </header>

      <div className="flex max-w-[1080px] mx-auto">
        {/* Sidebar */}
        <aside className={`w-[240px] shrink-0 p-4 sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto border-r ${
          dyslexiaMode ? "border-[#F0E6D3]" : "border-[#1E1E28]"
        }`}>
          <div className="text-[10px] font-bold tracking-widest uppercase opacity-40 mb-2.5">Sommaire</div>
          {course.sections.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(i)}
              className={`w-full text-left py-2 px-2.5 rounded-lg mb-0.5 flex items-center gap-2 text-xs border-l-[3px] transition-all ${
                activeSection === i
                  ? `${dyslexiaMode ? "bg-[#FFF0D6] text-[#1a1a2e]" : "bg-[#1E1E28] text-[#F0EDE8]"} font-bold`
                  : `border-transparent ${dyslexiaMode ? "text-[#5a5a7a]" : "text-[#7C7C8A]"}`
              }`}
              style={{ borderLeftColor: activeSection === i ? s.color : "transparent" }}
            >
              <span>{s.emoji}</span>
              <span>{s.title}</span>
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-7 min-w-0">
          {/* Section header */}
          <div className={`flex items-start gap-3.5 mb-7 pb-5 border-b ${dyslexiaMode ? "border-[#F0E6D3]" : "border-[#1E1E28]"}`}>
            <div className="w-[52px] h-[52px] rounded-[14px] shrink-0 flex items-center justify-center text-[26px]"
              style={{ background: section.color + "22", border: `2px solid ${section.color}44` }}>
              {section.emoji}
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-widest uppercase mb-0.5" style={{ color: section.color }}>
                Section {activeSection + 1} / {course.sections.length}
              </div>
              <h1 className="text-2xl font-bold leading-tight">{section.title}</h1>
            </div>
          </div>

          {/* Content */}
          <div className={`rounded-[14px] p-6 mb-6 ${
            dyslexiaMode ? "bg-white border-2 border-[#F0E6D3] shadow-[0_4px_20px_rgba(0,0,0,0.05)]" : "bg-[#16161E] border border-[#1E1E28]"
          }`}>
            {dyslexiaMode ? (
              <div>
                <div className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-lg bg-[#E8F8F0] text-xs text-[#059669] font-bold">
                  ✓ Mode dyslexie — texte simplifié ligne par ligne
                </div>
                {section.dyslexiaContent.map((line, i) => (
                  <div
                    key={i}
                    className="py-1 px-3 rounded-md mb-0.5"
                    style={{
                      background: i % 2 === 0 ? "#FFFDF5" : "#F5F8FF",
                      borderLeft: `3px solid ${i % 2 === 0 ? "#FFD166" : "#93C5FD"}`,
                      fontFamily: "'Trebuchet MS', sans-serif",
                      fontSize: "1.12rem",
                      lineHeight: 2.2,
                      letterSpacing: "0.07em",
                      wordSpacing: "0.2em",
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[15px] leading-[1.75] text-[#D4CFC8]">{section.content}</p>
            )}
          </div>

          {/* Keywords */}
          {section.keyWords.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold tracking-widest uppercase opacity-50 mb-3">Vocabulaire clé</h3>
              <div className="flex flex-wrap gap-2">
                {section.keyWords.map((kw, i) => (
                  <div key={i} className={`px-3.5 py-2 rounded-lg text-[13px] ${
                    dyslexiaMode ? "bg-[#FFF8E8] border-2 border-[#FFD166]" : "bg-[#1A1A22] border border-[#2A2A35]"
                  }`}>
                    <span className="font-bold" style={{ color: section.color }}>{kw.word}</span>
                    <span className="opacity-60 ml-2 text-xs">— {kw.def}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz */}
          {section.quiz.length > 0 && (
            <div className={`rounded-[14px] p-6 ${
              dyslexiaMode ? "bg-[#F0F7FF] border-2 border-[#BFDBFE]" : "bg-[#12121A] border border-[#1E1E28]"
            }`}>
              <h3 className={`text-xs font-bold tracking-widest uppercase mb-4 ${dyslexiaMode ? "text-[#2563EB]" : "text-[#60A5FA]"}`}>
                Questions de compréhension
              </h3>
              {section.quiz.map((q, qi) => {
                const key = `${section.id}-${qi}`;
                const st = quizState[key];
                return (
                  <div key={qi} className={qi < section.quiz.length - 1 ? "mb-6" : ""}>
                    <div className="text-sm font-semibold mb-3 leading-relaxed">{q.q}</div>
                    <div className="flex flex-col gap-2">
                      {q.options.map((opt, oi) => {
                        const isSelected = st?.selected === oi;
                        const isCorrect = oi === q.answer;
                        const showResult = st?.answered;
                        let classes = dyslexiaMode
                          ? "bg-white border-[#E2D9F3] text-[#1a1a2e]"
                          : "bg-[#1A1A22] border-[#2A2A35] text-[#D4CFC8]";
                        if (showResult && isCorrect) classes = "bg-[#E8F8F0] border-[#059669] text-[#065F46]";
                        if (showResult && isSelected && !isCorrect) classes = "bg-[#FEE8E8] border-[#DC2626] text-[#7F1D1D]";
                        return (
                          <button
                            key={oi}
                            onClick={() => handleQuiz(section.id, qi, oi)}
                            className={`p-3 rounded-lg border-2 text-left text-[13px] flex items-center gap-2 transition-all ${classes} ${
                              st?.answered ? "cursor-default" : "cursor-pointer hover:opacity-80"
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center text-[11px] font-bold"
                              style={{ borderColor: "inherit" }}>
                              {showResult && isCorrect ? "✓" : showResult && isSelected ? "✗" : String.fromCharCode(65 + oi)}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {st?.answered && (
                      <div className={`mt-2.5 p-3 rounded-lg text-[13px] leading-relaxed ${
                        st.correct ? "bg-[#E8F8F0] border border-[#059669] text-[#065F46]" : "bg-[#FEF3C7] border border-[#D97706] text-[#92400E]"
                      }`}>
                        <strong>{st.correct ? "✓ Correct !" : "Pas tout à fait."}</strong>{" "}{q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-7">
            <button
              onClick={() => activeSection > 0 && setActiveSection((a) => a - 1)}
              disabled={activeSection === 0}
              className={`px-5 py-2.5 rounded-lg font-bold text-[13px] transition-all ${
                activeSection === 0 ? "opacity-50 cursor-default" : "cursor-pointer"
              } ${dyslexiaMode ? "bg-[#F0E6D3] text-[#1a1a2e]" : "bg-[#2A2A35] text-[#F0EDE8]"}`}
            >
              ← Précédent
            </button>
            <button
              onClick={() => activeSection < course.sections.length - 1 && setActiveSection((a) => a + 1)}
              disabled={activeSection === course.sections.length - 1}
              className={`px-5 py-2.5 rounded-lg font-bold text-[13px] text-white transition-all ${
                activeSection === course.sections.length - 1 ? "opacity-50 cursor-default" : "cursor-pointer"
              }`}
              style={{ background: activeSection < course.sections.length - 1 ? section.color : dyslexiaMode ? "#E8E0D5" : "#1A1A22" }}
            >
              Suivant →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
