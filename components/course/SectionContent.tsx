"use client";

import { useState } from "react";
import { CourseImage } from "@/types/course";
import ImageBlock from "./ImageBlock";

interface KeyWord {
  word: string;
  def: string;
}

interface SectionContentProps {
  content: string;
  keyWords: KeyWord[];
  fontSize: number;
  images?: CourseImage[];
  dyslexiaMode?: boolean;
}

export default function SectionContent({
  content,
  keyWords,
  fontSize,
  images = [],
  dyslexiaMode = false,
}: SectionContentProps) {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  const paragraphs = content.split(/\n\n+/);

  return (
    <div>
      {paragraphs.map((para, i) => (
        <div key={i}>
          <p className="m-0 mb-4 text-[#D4CFC8]" style={{ fontSize: `${15 * fontSize}px`, lineHeight: 1.75 }}>
            {renderWithKeywords(para, keyWords, hoveredWord, setHoveredWord)}
          </p>
          {images
            .filter((img) => img.position === `after_paragraph_${i + 1}`)
            .map((img) => (
              <ImageBlock key={img.id} image={img} dyslexiaMode={dyslexiaMode} />
            ))}
        </div>
      ))}
    </div>
  );
}

function renderWithKeywords(
  text: string,
  keywords: KeyWord[],
  hoveredWord: string | null,
  setHoveredWord: (word: string | null) => void
) {
  if (!text || !keywords.length) return text;

  const parts: Array<{ type: "text" | "keyword"; content: string; def?: string }> = [];
  let remaining = text;

  keywords.forEach((kw) => {
    const idx = remaining.indexOf(kw.word);
    if (idx !== -1) {
      if (idx > 0) parts.push({ type: "text", content: remaining.slice(0, idx) });
      parts.push({ type: "keyword", content: kw.word, def: kw.def });
      remaining = remaining.slice(idx + kw.word.length);
    }
  });
  if (remaining) parts.push({ type: "text", content: remaining });

  return parts.map((p, i) =>
    p.type === "keyword" ? (
      <span key={i} className="relative inline">
        <span
          onMouseEnter={() => setHoveredWord(p.content)}
          onMouseLeave={() => setHoveredWord(null)}
          className="border-b-2 border-dashed border-[#E8521A] cursor-help text-[#F4A261] font-semibold"
        >
          {p.content}
        </span>
        {hoveredWord === p.content && (
          <span className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#1A1A22] text-[#F0EDE8] px-3 py-2 rounded-lg text-[12px] w-[190px] text-center leading-snug border border-[#2A2A35] shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-[200] pointer-events-none whitespace-normal">
            {p.def}
          </span>
        )}
      </span>
    ) : (
      <span key={i}>{p.content}</span>
    )
  );
}
