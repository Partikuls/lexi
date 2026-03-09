"use client";

const STEPS = [
  { icon: "📄", label: "Lecture du document" },
  { icon: "🖼️", label: "Analyse des images" },
  { icon: "🧠", label: "Structuration pédagogique" },
  { icon: "♿", label: "Adaptation dyslexie" },
  { icon: "❓", label: "Génération des quiz" },
  { icon: "✅", label: "Finalisation du cours" },
];

interface ProcessingStepsProps {
  currentStep: number;
  imageProgress?: string;
  error?: string | null;
  onRetry?: () => void;
}

export default function ProcessingSteps({
  currentStep,
  imageProgress,
  error,
  onRetry,
}: ProcessingStepsProps) {
  return (
    <div className="flex flex-col items-center">
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
          {onRetry && (
            <button onClick={onRetry} className="mt-2 block text-[#E8521A] underline">
              Retour à l&apos;upload
            </button>
          )}
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
                active
                  ? "bg-[#1E1228] border border-[rgba(124,58,237,0.27)]"
                  : done
                    ? "bg-[#131318]"
                    : ""
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
                  done
                    ? "text-[#6EE7B7]"
                    : active
                      ? "text-[#DDD6FE] font-bold"
                      : "text-[#7C7C8A]"
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
