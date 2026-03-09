"use client";

interface DyslexiaContentProps {
  lines: string[];
  fontSize: number;
}

export default function DyslexiaContent({ lines, fontSize }: DyslexiaContentProps) {
  const fs = fontSize * 1.12;

  return (
    <div>
      <div className="dys-banner">
        ✓ Mode dyslexie — texte simplifié ligne par ligne
      </div>
      {lines.map((line, i) => (
        <div
          key={i}
          className={`dys-line ${i % 2 === 0 ? "dys-line-odd" : "dys-line-even"}`}
          style={{ fontSize: `${16 * fs}px` }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}
