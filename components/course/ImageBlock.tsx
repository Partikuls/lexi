"use client";

import { useState } from "react";
import { CourseImage } from "@/types/course";
import ImageFallback from "./ImageFallback";

interface ImageBlockProps {
  image: CourseImage;
  dyslexiaMode: boolean;
}

export default function ImageBlock({ image, dyslexiaMode }: ImageBlockProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!image.url || hasError) {
    return <ImageFallback altText={image.altText} dyslexiaMode={dyslexiaMode} />;
  }

  return (
    <figure className="my-4">
      <div
        className={`relative inline-block w-full ${
          dyslexiaMode ? "dys-image-border" : "rounded-lg overflow-hidden"
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={image.altText}
          loading="lazy"
          onError={() => setHasError(true)}
          className="w-full h-auto block"
        />

        {/* SCHEMA tooltip on hover (standard mode only) */}
        {image.type === "SCHEMA" && !dyslexiaMode && showTooltip && image.keyElements.length > 0 && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1A1A22] text-[#F0EDE8] p-3 rounded-lg border border-[#2A2A35] shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-10 w-[260px]">
            <div className="text-[10px] font-bold tracking-widest uppercase opacity-50 mb-1.5">
              Éléments clés
            </div>
            <ul className="text-xs leading-relaxed">
              {image.keyElements.map((el, i) => (
                <li key={i} className="flex gap-1.5 mb-0.5">
                  <span className="text-[#F4A261] shrink-0">•</span>
                  <span>{el}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Dyslexia captions */}
      {dyslexiaMode && (
        <figcaption className="mt-2">
          <p
            className="text-sm font-semibold text-[#1a1a2e]"
            style={{
              fontFamily: "'Trebuchet MS', sans-serif",
              lineHeight: 1.8,
              letterSpacing: "0.07em",
            }}
          >
            {image.dyslexiaCaption}
          </p>

          {/* SCHEMA: show key elements as bullets in dyslexia mode */}
          {image.type === "SCHEMA" && image.keyElements.length > 0 && (
            <ul className="mt-1.5 text-sm text-[#1a1a2e]" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
              {image.keyElements.map((el, i) => (
                <li key={i} className="flex gap-1.5 mb-0.5">
                  <span className="text-[#E8521A] shrink-0">→</span>
                  <span>{el}</span>
                </li>
              ))}
            </ul>
          )}

          {/* EXERCICE: show full description before quiz */}
          {image.type === "EXERCICE" && (
            <div className="mt-2 p-3 rounded-lg bg-[#FFF8E8] border border-[#FFD166]">
              <div className="text-xs font-bold text-[#D97706] mb-1">Description de l&apos;exercice :</div>
              <p className="text-sm text-[#1a1a2e]" style={{ fontFamily: "'Trebuchet MS', sans-serif", lineHeight: 1.8 }}>
                {image.altText}
              </p>
            </div>
          )}
        </figcaption>
      )}
    </figure>
  );
}
