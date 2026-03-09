"use client";

interface ImageFallbackProps {
  altText: string;
  dyslexiaMode: boolean;
}

export default function ImageFallback({ altText, dyslexiaMode }: ImageFallbackProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg p-6 ${
        dyslexiaMode
          ? "bg-[#FFF8E8] border-2 border-dashed border-[#FFD166]"
          : "bg-[#1E1E28] border border-dashed border-[#2A2A35]"
      }`}
    >
      <div className="text-center">
        <div className="text-3xl mb-2 opacity-40">🖼️</div>
        <p
          className={`text-sm italic ${
            dyslexiaMode ? "text-[#6a6a8a]" : "text-[#7C7C8A]"
          }`}
        >
          {altText || "Image non disponible"}
        </p>
      </div>
    </div>
  );
}
