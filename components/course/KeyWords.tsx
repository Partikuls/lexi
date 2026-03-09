"use client";

interface KeyWordsProps {
  keyWords: { word: string; def: string }[];
  sectionColor: string;
  dyslexiaMode: boolean;
  fontSize: number;
}

export default function KeyWords({
  keyWords,
  sectionColor,
  dyslexiaMode,
  fontSize,
}: KeyWordsProps) {
  if (keyWords.length === 0) return null;

  const fs = fontSize * (dyslexiaMode ? 1.12 : 1);

  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold tracking-widest uppercase opacity-50 mb-3">
        Vocabulaire clé
      </h3>
      <div className="flex flex-wrap gap-2">
        {keyWords.map((kw, i) => (
          <div
            key={i}
            className={`px-3.5 py-2 rounded-lg ${
              dyslexiaMode
                ? "bg-[#FFF8E8] border-2 border-[#FFD166]"
                : "bg-[#1A1A22] border border-[#2A2A35]"
            }`}
            style={{ fontSize: `${13 * fs}px` }}
          >
            <span className="font-bold" style={{ color: sectionColor }}>
              {kw.word}
            </span>
            <span className="opacity-60 ml-2" style={{ fontSize: `${12 * fs}px` }}>
              — {kw.def}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
