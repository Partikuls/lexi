"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProcessingSteps from "@/components/upload/ProcessingSteps";

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

      if (imageCount > 0) {
        setImageProgress(`Analyse image 1/${imageCount}...`);
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
        body: JSON.stringify({ text, imageAnalyses: [], courseId }),
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
              const resultDataLine = lines[lines.indexOf(line) + 1];
              let courseToken = courseId;
              if (resultDataLine?.startsWith("data: ")) {
                try {
                  const resultData = JSON.parse(resultDataLine.slice(6));
                  if (resultData.token) courseToken = resultData.token;
                } catch { /* use courseId fallback */ }
              }
              setCurrentStep(5);
              await delay(500);
              router.push(`/course/${courseToken}`);
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

      // Fallback: fetch token and go to course page
      setCurrentStep(5);
      await delay(500);
      const tokenRes = await fetch(`/api/course-token/${courseId}`);
      const tokenData = await tokenRes.json().catch(() => ({}));
      router.push(`/course/${tokenData.token || courseId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F13] to-[#1A1028] flex flex-col items-center justify-center p-6 font-serif">
      <ProcessingSteps
        currentStep={currentStep}
        imageProgress={imageProgress}
        error={error}
        onRetry={() => router.push("/upload")}
      />
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
