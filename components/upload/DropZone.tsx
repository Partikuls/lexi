"use client";

import { useState, useRef } from "react";

interface DropZoneProps {
  onFile: (file: File) => void;
  uploading: boolean;
}

export default function DropZone({ onFile, uploading }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    onFile(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      }}
      onClick={() => !uploading && fileRef.current?.click()}
      className={`m-6 rounded-xl border-2 border-dashed p-5 flex items-center gap-4 transition-all ${
        uploading ? "opacity-60 cursor-wait" : "cursor-pointer"
      } ${dragOver ? "border-[#E8521A] bg-[rgba(232,82,26,0.05)]" : "border-[#2A2A35]"}`}
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
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />
    </div>
  );
}
