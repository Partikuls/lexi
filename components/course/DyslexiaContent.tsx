"use client";

import { CourseImage } from "@/types/course";
import ImageBlock from "./ImageBlock";

interface DyslexiaContentProps {
  lines: string[];
  fontSize: number;
  images?: CourseImage[];
}

export default function DyslexiaContent({ lines, fontSize, images = [] }: DyslexiaContentProps) {
  const fs = fontSize * 1.12;

  // Group lines into paragraphs (empty lines = paragraph break)
  const paragraphs: string[][] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (line.trim() === "") {
      if (current.length > 0) {
        paragraphs.push(current);
        current = [];
      }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) paragraphs.push(current);

  // If no paragraph breaks, treat all lines as one paragraph
  const groups = paragraphs.length > 0 ? paragraphs : [lines];
  let lineIndex = 0;

  return (
    <div>
      <div className="dys-banner">
        ✓ Mode dyslexie — texte simplifié ligne par ligne
      </div>
      {groups.map((group, gi) => {
        const startIdx = lineIndex;
        lineIndex += group.length;
        return (
          <div key={gi}>
            {group.map((line, li) => {
              const globalIdx = startIdx + li;
              return (
                <div
                  key={globalIdx}
                  className={`dys-line ${globalIdx % 2 === 0 ? "dys-line-odd" : "dys-line-even"}`}
                  style={{ fontSize: `${16 * fs}px` }}
                >
                  {line}
                </div>
              );
            })}
            {images
              .filter((img) => img.position === `after_paragraph_${gi + 1}`)
              .map((img) => (
                <ImageBlock key={img.id} image={img} dyslexiaMode={true} />
              ))}
          </div>
        );
      })}
    </div>
  );
}
