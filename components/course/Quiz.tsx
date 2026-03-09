"use client";

import { QuizQuestion } from "@/types/course";

interface QuizState {
  answered: boolean;
  selected: number;
  correct: boolean;
}

interface QuizProps {
  questions: QuizQuestion[];
  sectionId: number;
  quizState: Record<string, QuizState>;
  onAnswer: (sectionId: number, questionIdx: number, answerIdx: number) => void;
  dyslexiaMode: boolean;
  fontSize: number;
}

export default function Quiz({
  questions,
  sectionId,
  quizState,
  onAnswer,
  dyslexiaMode,
  fontSize,
}: QuizProps) {
  if (questions.length === 0) return null;

  const fs = fontSize * (dyslexiaMode ? 1.12 : 1);

  return (
    <div
      className={`rounded-[14px] p-6 ${
        dyslexiaMode
          ? "bg-[#F0F7FF] border-2 border-[#BFDBFE]"
          : "bg-[#12121A] border border-[#1E1E28]"
      }`}
    >
      <h3
        className={`text-xs font-bold tracking-widest uppercase mb-4 ${
          dyslexiaMode ? "text-[#2563EB]" : "text-[#60A5FA]"
        }`}
      >
        ✎ Questions de compréhension
      </h3>

      {questions.map((q, qi) => {
        const key = `${sectionId}-${qi}`;
        const st = quizState[key];
        return (
          <div key={qi} className={qi < questions.length - 1 ? "mb-6" : ""}>
            <div
              className="font-semibold mb-3 leading-relaxed"
              style={{
                fontSize: `${(dyslexiaMode ? 16 : 14) * fs}px`,
                fontWeight: dyslexiaMode ? 700 : 600,
                letterSpacing: dyslexiaMode ? "0.07em" : "normal",
              }}
            >
              {q.q}
            </div>
            <div className="flex flex-col gap-2">
              {q.options.map((opt, oi) => {
                const isSelected = st?.selected === oi;
                const isCorrect = oi === q.answer;
                const showResult = st?.answered;

                let classes = dyslexiaMode
                  ? "bg-white border-[#E2D9F3] text-[#1a1a2e]"
                  : "bg-[#1A1A22] border-[#2A2A35] text-[#D4CFC8]";
                if (showResult && isCorrect)
                  classes = "bg-[#E8F8F0] border-[#059669] text-[#065F46]";
                if (showResult && isSelected && !isCorrect)
                  classes = "bg-[#FEE8E8] border-[#DC2626] text-[#7F1D1D]";

                return (
                  <button
                    key={oi}
                    onClick={() => onAnswer(sectionId, qi, oi)}
                    className={`p-3 rounded-lg border-2 text-left flex items-center gap-2 transition-all ${classes} ${
                      st?.answered ? "cursor-default" : "cursor-pointer hover:opacity-80"
                    }`}
                    style={{ fontSize: `${(dyslexiaMode ? 15 : 13) * fs}px` }}
                    disabled={st?.answered}
                  >
                    <span className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center text-[11px] font-bold border-inherit">
                      {showResult && isCorrect
                        ? "✓"
                        : showResult && isSelected
                          ? "✗"
                          : String.fromCharCode(65 + oi)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {st?.answered && (
              <div
                className={`mt-2.5 p-3 rounded-lg leading-relaxed ${
                  st.correct
                    ? "bg-[#E8F8F0] border border-[#059669] text-[#065F46]"
                    : "bg-[#FEF3C7] border border-[#D97706] text-[#92400E]"
                }`}
                style={{ fontSize: `${13 * fs}px` }}
              >
                <strong>{st.correct ? "✓ Correct !" : "⚠ Pas tout à fait."}</strong>{" "}
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
