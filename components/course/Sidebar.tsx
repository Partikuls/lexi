"use client";

import { CourseSection } from "@/types/course";

interface SidebarProps {
  sections: CourseSection[];
  objectives: string[];
  activeSection: number;
  onSectionChange: (index: number) => void;
  dyslexiaMode: boolean;
  fontSize: number;
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  sections,
  objectives,
  activeSection,
  onSectionChange,
  dyslexiaMode,
  fontSize,
  open,
  onClose,
}: SidebarProps) {
  const completedCount = activeSection + 1;
  const totalSections = sections.length;
  const fs = fontSize * (dyslexiaMode ? 1.12 : 1);

  const handleSectionClick = (i: number) => {
    onSectionChange(i);
    onClose?.();
  };

  return (
    <>
      {/* Overlay for mobile/tablet drawer */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          w-[240px] shrink-0 p-4 overflow-y-auto border-r
          ${dyslexiaMode ? "border-[#F0E6D3]" : "border-[#1E1E28]"}
          ${dyslexiaMode ? "bg-[#FFF8F0]" : "bg-[#0F0F13]"}
          fixed top-[60px] h-[calc(100vh-60px)] z-40
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:sticky lg:z-0
        `}
      >
      {/* Progress */}
      <div className="mb-5">
        <div className="text-[10px] font-bold tracking-widest uppercase opacity-40 mb-1.5">
          Progression
        </div>
        <div
          className={`h-[5px] rounded-[3px] ${
            dyslexiaMode ? "bg-[#E8E0D5]" : "bg-[#2A2A35]"
          }`}
        >
          <div
            className={`h-full rounded-[3px] transition-[width] duration-500 ${
              dyslexiaMode ? "bg-[#059669]" : "bg-[#E8521A]"
            }`}
            style={{ width: `${(completedCount / totalSections) * 100}%` }}
          />
        </div>
        <div className="text-[11px] mt-1 opacity-50">
          {completedCount}/{totalSections} sections
        </div>
      </div>

      {/* Section nav */}
      <div className="text-[10px] font-bold tracking-widest uppercase opacity-40 mb-2.5">
        Sommaire
      </div>
      {sections.map((s, i) => (
        <button
          key={s.id}
          onClick={() => handleSectionClick(i)}
          className={`w-full text-left py-2 px-2.5 rounded-lg mb-0.5 flex items-center gap-2 border-l-[3px] transition-all ${
            activeSection === i
              ? `${dyslexiaMode ? "bg-[#FFF0D6] text-[#1a1a2e]" : "bg-[#1E1E28] text-[#F0EDE8]"} font-bold`
              : `border-transparent ${dyslexiaMode ? "text-[#5a5a7a]" : "text-[#7C7C8A]"}`
          }`}
          style={{
            borderLeftColor: activeSection === i ? s.color : "transparent",
            fontSize: `${12 * fs}px`,
          }}
        >
          <span>{s.emoji}</span>
          <span>{s.title}</span>
          {i < activeSection && (
            <span className="ml-auto text-[10px] text-[#059669]">✓</span>
          )}
        </button>
      ))}

      {/* Objectives */}
      <div
        className={`mt-5 p-3 rounded-[10px] border ${
          dyslexiaMode
            ? "bg-[#F0F7FF] border-[#BFDBFE]"
            : "bg-[#16161E] border-[#1E1E28]"
        }`}
      >
        <div className="text-[10px] font-bold tracking-widest uppercase opacity-50 mb-2">
          Objectifs
        </div>
        {objectives.map((o, i) => (
          <div
            key={i}
            className="flex gap-1.5 mb-1.5 leading-snug opacity-70"
            style={{ fontSize: `${11 * fs}px` }}
          >
            <span className="text-[#059669] shrink-0">→</span>
            <span>{o}</span>
          </div>
        ))}
      </div>
    </aside>
    </>
  );
}
