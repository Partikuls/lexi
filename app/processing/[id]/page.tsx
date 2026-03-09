"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const STEPS = [
  { icon: "📄", label: "Lecture du document" },
  { icon: "🖼️", label: "Analyse des images" },
  { icon: "🧠", label: "Structuration pédagogique" },
  { icon: "♿", label: "Adaptation dyslexie" },
  { icon: "❓", label: "Génération des quiz" },
  { icon: "✅", label: "Finalisation du cours" },
];

export default function ProcessingPage({
  params,
}: {
  params: { id: string };
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [imageProgress, setImageProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageCount = parseInt(searchParams.get("images") || "0", 10);

  useEffect(() => {
    processDocument();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function processDocument() {
    const text = searchParams.get("text") || "";
    const courseId = params.id;

    try {
      // Step 0: Document already parsed
      setCurrentStep(0);
      await delay(800);

      // Step 1: Analyze images (if any)
      setCurrentStep(1);
      const imageAnalyses: unknown[] = [];

      if (imageCount > 0) {
        setImageProgress(`Analyse image 1/${imageCount}...`);
        // In a full implementation, we'd call /api/analyze-images here
        // For now, simulate progress
        for (let i = 1; i <= imageCount; i++) {
          setImageProgress(`Analyse image ${i}/${imageCount}...`);
          await delay(500);
        }
      } else {
        await delay(600);
      }

      // Step 2-4: Transform with SSE
      setCurrentStep(2);
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, imageAnalyses }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la transformation");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("event: status")) {
              const dataLine = lines[lines.indexOf(line) + 1];
              if (dataLine?.startsWith("data: ")) {
                const data = JSON.parse(dataLine.slice(6));
                if (data.step === "structuring") setCurrentStep(3);
                if (data.step === "complete") setCurrentStep(4);
              }
            }
            if (line.startsWith("event: result")) {
              setCurrentStep(5);
              await delay(500);
              // Navigate to course view
              router.push(`/course/${courseId}`);
              return;
            }
            if (line.startsWith("event: error")) {
              const dataLine = lines[lines.indexOf(line) + 1];
              if (dataLine?.startsWith("data: ")) {
                const data = JSON.parse(dataLine.slice(6));
                throw new Error(data.message);
              }
            }
          }
        }
      }

      // Fallback: go to course page
      setCurrentStep(5);
      await delay(500);
      router.push(`/course/${courseId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F13] to-[#1A1028] flex flex-col items-center justify-center p-6 font-serif">
      {/* Pulsing logo */}
      <div className="w-[72px] h-[72px] rounded-[20px] mx-auto mb-8 bg-gradient-to-br from-[#E8521A] to-[#F4A261] flex items-center justify-center text-4xl font-black text-white shadow-[0_8px_32px_rgba(232,82,26,0.4)] animate-pulse">
        L
      </div>

      <h2 className="text-[#F0EDE8] text-[22px] font-bold mb-2">
        Transformation en cours...
      </h2>
      <p className="text-[#7C7C8A] text-sm mb-10">
        L&apos;agent analyse et restructure votre cours
      </p>

      {error && (
        <div className="w-full max-w-[420px] mb-6 p-4 rounded-xl bg-[#2A1010] border border-[#7F1D1D] text-[#FCA5A5] text-sm">
          {error}
          <button
            onClick={() => router.push("/upload")}
            className="mt-2 block text-[#E8521A] underline"
          >
            Retour à l&apos;upload
          </button>
        </div>
      )}

      {/* Steps */}
      <div className="w-full max-w-[420px]">
        {STEPS.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <div
              key={i}
              className={`flex items-center gap-3.5 p-3 rounded-xl mb-1.5 transition-all duration-400 ${
                active ? "bg-[#1E1228] border border-[rgba(124,58,237,0.27)]" : done ? "bg-[#131318]" : ""
              } ${i > currentStep ? "opacity-30" : "opacity-100"}`}
            >
              <div
                className={`w-9 h-9 rounded-[10px] shrink-0 flex items-center justify-center text-xl transition-all ${
                  done ? "bg-[#059669]" : active ? "bg-[#7C3AED]" : "bg-[#1E1E28]"
                }`}
              >
                {done ? <span className="text-base">✓</span> : step.icon}
              </div>
              <span
                className={`text-sm transition-all ${
                  done ? "text-[#6EE7B7]" : active ? "text-[#DDD6FE] font-bold" : "text-[#7C7C8A]"
                }`}
              >
                {step.label}
                {active && i === 1 && imageProgress && (
                  <span className="ml-2 text-xs text-[#A78BFA]">{imageProgress}</span>
                )}
              </span>
              {active && (
                <div className="ml-auto flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <div
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
