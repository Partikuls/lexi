"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [inputText, setInputText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'upload");
        setUploading(false);
        return;
      }

      // Navigate to processing page with courseId
      router.push(`/processing/${data.courseId}?images=${data.imageCount}&text=${encodeURIComponent(data.text.slice(0, 500))}`);
    } catch {
      setError("Erreur réseau lors de l'upload");
      setUploading(false);
    }
  };

  const handleTextSubmit = () => {
    if (!inputText.trim()) return;
    // For text input, go directly to processing with text as query
    router.push(`/processing/text?text=${encodeURIComponent(inputText)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F13] to-[#1A1028] flex flex-col items-center justify-center p-6 font-serif">
      {/* Logo */}
      <div className="text-center mb-12">
        <div className="w-[72px] h-[72px] rounded-[20px] mx-auto mb-4 bg-gradient-to-br from-[#E8521A] to-[#F4A261] flex items-center justify-center text-4xl font-black text-white shadow-[0_8px_32px_rgba(232,82,26,0.4)]">
          L
        </div>
        <h1 className="text-4xl font-bold text-[#F0EDE8]">Lexi</h1>
        <p className="mt-2 text-[#7C7C8A] text-base">
          Transforme n&apos;importe quel cours en expérience interactive
        </p>
      </div>

      {/* Upload card */}
      <div className="w-full max-w-[640px] bg-[#16161E] rounded-[20px] border border-[#2A2A35] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
          className={`m-6 rounded-xl border-2 border-dashed p-5 flex items-center gap-4 cursor-pointer transition-all ${
            dragOver ? "border-[#E8521A] bg-[rgba(232,82,26,0.05)]" : "border-[#2A2A35]"
          }`}
        >
          <div className="w-11 h-11 rounded-[10px] bg-[#1E1E28] flex items-center justify-center text-xl shrink-0">
            {fileName ? "✓" : "📄"}
          </div>
          <div>
            <div className="text-[#F0EDE8] font-semibold text-sm">
              {fileName || "Glisser un fichier Word / PDF"}
            </div>
            <div className="text-[#7C7C8A] text-xs mt-0.5">
              {fileName ? "Fichier sélectionné" : "ou cliquer pour parcourir"}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".docx,.pdf"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />
        </div>

        <div className="text-center text-[#4A4A55] text-[13px] -mt-2 mb-2">ou</div>

        {/* Textarea */}
        <div className="px-6 pb-6">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Coller le contenu du cours ici..."
            className="w-full min-h-[180px] bg-[#1A1A22] border border-[#2A2A35] rounded-xl p-4 resize-y text-[#D4CFC8] text-sm leading-relaxed font-mono outline-none focus:border-[#E8521A] transition-colors"
          />

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-[#2A1010] border border-[#7F1D1D] text-[#FCA5A5] text-[13px]">
              {error}
            </div>
          )}

          <button
            onClick={handleTextSubmit}
            disabled={!inputText.trim() || uploading}
            className={`w-full mt-4 py-4 rounded-xl border-none font-bold text-base font-serif transition-all ${
              inputText.trim() && !uploading
                ? "bg-gradient-to-r from-[#E8521A] to-[#F4A261] text-white shadow-[0_4px_20px_rgba(232,82,26,0.35)] cursor-pointer hover:opacity-90"
                : "bg-[#2A2A35] text-[#4A4A55] cursor-not-allowed"
            }`}
          >
            {uploading ? "Upload en cours..." : inputText.trim() ? "Transformer en cours interactif" : "Ajoute un cours pour commencer"}
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="flex gap-4 mt-8 flex-wrap justify-center">
        {[
          { icon: "🧠", label: "Structuration IA" },
          { icon: "♿", label: "Mode dyslexie" },
          { icon: "❓", label: "Quiz génératifs" },
          { icon: "📖", label: "Mots-clés définis" },
        ].map((f, i) => (
          <div
            key={i}
            className="px-4 py-2 rounded-full bg-[#16161E] border border-[#2A2A35] text-[#7C7C8A] text-[13px] flex items-center gap-1.5"
          >
            {f.icon} {f.label}
          </div>
        ))}
      </div>
    </div>
  );
}
