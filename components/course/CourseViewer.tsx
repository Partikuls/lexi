"use client";

import { useState } from "react";
import { CourseJSON } from "@/types/course";
import { useDyslexiaMode } from "@/hooks/useDyslexiaMode";
import { useFontSize } from "@/hooks/useFontSize";
import Sidebar from "./Sidebar";
import SectionContent from "./SectionContent";
import DyslexiaContent from "./DyslexiaContent";
import KeyWords from "./KeyWords";
import Quiz from "./Quiz";

interface CourseViewerProps {
  course: CourseJSON;
}

interface QuizState {
  answered: boolean;
  selected: number;
  correct: boolean;
}

export default function CourseViewer({ course }: CourseViewerProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [quizState, setQuizState] = useState<Record<string, QuizState>>({});
  const { enabled: dyslexiaMode, toggle: toggleDyslexia } = useDyslexiaMode();
  const { size: fontSize, increase, decrease } = useFontSize();

  const section = course.sections[activeSection];

  const handleQuiz = (sectionId: number, qi: number, ansIdx: number) => {
    const key = `${sectionId}-${qi}`;
    if (quizState[key]?.answered) return;
    setQuizState((prev) => ({
      ...prev,
      [key]: {
        answered: true,
        selected: ansIdx,
        correct: ansIdx === section.quiz[qi].answer,
      },
    }));
  };

  const bg = dyslexiaMode ? "bg-[#FFF8F0]" : "bg-[#0F0F13]";
  const textColor = dyslexiaMode ? "text-[#1a1a2e]" : "text-[#F0EDE8]";

  return (
    <div className={`min-h-screen ${bg} ${textColor} transition-all duration-300`}>
      {/* Header */}
      <header
        className={`sticky top-0 z-50 px-5 h-[60px] flex items-center justify-between ${
          dyslexiaMode
            ? "bg-white border-b-[3px] border-[#FFD166] shadow-sm"
            : "bg-[#1A1A22] border-b border-[#2A2A35] shadow-[0_2px_20px_rgba(0,0,0,0.4)]"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8521A] to-[#F4A261] flex items-center justify-center text-base font-black text-white">
            L
          </div>
          <div>
            <div className="font-bold text-sm">{course.title}</div>
            <div className="text-[11px] opacity-50">
              {course.subject} · {course.level} · {course.duration}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={decrease}
            className={`px-2.5 py-1 rounded-md text-xs font-bold ${
              dyslexiaMode ? "bg-[#F0E6D3] text-[#1a1a2e]" : "bg-[#2A2A35] text-[#F0EDE8]"
            }`}
          >
            A−
          </button>
          <button
            onClick={increase}
            className={`px-2.5 py-1 rounded-md text-xs font-bold ${
              dyslexiaMode ? "bg-[#F0E6D3] text-[#1a1a2e]" : "bg-[#2A2A35] text-[#F0EDE8]"
            }`}
          >
            A+
          </button>
          <button
            onClick={toggleDyslexia}
            className={`px-3.5 py-1.5 rounded-full text-white text-xs font-bold transition-all ${
              dyslexiaMode
                ? "bg-[#059669] shadow-[0_0_12px_rgba(5,150,105,0.35)]"
                : "bg-[#E8521A] shadow-[0_0_12px_rgba(232,82,26,0.35)]"
            }`}
          >
            {dyslexiaMode ? "✓ Dyslexie ON" : "◎ Mode dyslexie"}
          </button>
        </div>
      </header>

      <div className="flex max-w-[1080px] mx-auto">
        {/* Sidebar */}
        <Sidebar
          sections={course.sections}
          objectives={course.objectives}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          dyslexiaMode={dyslexiaMode}
          fontSize={fontSize}
        />

        {/* Main content */}
        <main className="flex-1 p-7 min-w-0">
          {/* Section header */}
          <div
            className={`flex items-start gap-3.5 mb-7 pb-5 border-b ${
              dyslexiaMode ? "border-[#F0E6D3]" : "border-[#1E1E28]"
            }`}
          >
            <div
              className="w-[52px] h-[52px] rounded-[14px] shrink-0 flex items-center justify-center text-[26px]"
              style={{
                background: section.color + "22",
                border: `2px solid ${section.color}44`,
              }}
            >
              {section.emoji}
            </div>
            <div>
              <div
                className="text-[11px] font-bold tracking-widest uppercase mb-0.5"
                style={{ color: section.color }}
              >
                Section {activeSection + 1} / {course.sections.length}
              </div>
              <h1 className="text-2xl font-bold leading-tight">{section.title}</h1>
            </div>
          </div>

          {/* Content */}
          <div
            className={`rounded-[14px] p-6 mb-6 ${
              dyslexiaMode
                ? "bg-white border-2 border-[#F0E6D3] shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                : "bg-[#16161E] border border-[#1E1E28]"
            }`}
          >
            {dyslexiaMode ? (
              <DyslexiaContent lines={section.dyslexiaContent} fontSize={fontSize} />
            ) : (
              <SectionContent
                content={section.content}
                keyWords={section.keyWords}
                fontSize={fontSize}
              />
            )}
          </div>

          {/* Keywords */}
          <KeyWords
            keyWords={section.keyWords}
            sectionColor={section.color}
            dyslexiaMode={dyslexiaMode}
            fontSize={fontSize}
          />

          {/* Quiz */}
          <Quiz
            questions={section.quiz}
            sectionId={section.id}
            quizState={quizState}
            onAnswer={handleQuiz}
            dyslexiaMode={dyslexiaMode}
            fontSize={fontSize}
          />

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
              onClick={() =>
                activeSection < course.sections.length - 1 &&
                setActiveSection((a) => a + 1)
              }
              disabled={activeSection === course.sections.length - 1}
              className={`px-5 py-2.5 rounded-lg font-bold text-[13px] text-white transition-all ${
                activeSection === course.sections.length - 1
                  ? "opacity-50 cursor-default"
                  : "cursor-pointer"
              }`}
              style={{
                background:
                  activeSection < course.sections.length - 1
                    ? section.color
                    : dyslexiaMode
                      ? "#E8E0D5"
                      : "#1A1A22",
              }}
            >
              Suivant →
            </button>
          </div>

          {/* Completion */}
          {activeSection === course.sections.length - 1 && (
            <div
              className={`mt-7 p-6 rounded-[14px] text-center border-2 border-[#059669] ${
                dyslexiaMode ? "bg-[#E8F8F0]" : "bg-[#0D1F17]"
              }`}
            >
              <div className="text-4xl mb-2.5">🎉</div>
              <h3 className="text-lg font-bold text-[#059669] mb-1">Cours terminé !</h3>
              <p className="opacity-70 text-sm">
                Tu as parcouru les {course.sections.length} sections de ce cours.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
