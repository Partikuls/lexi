import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F13]">
      <div className="text-center">
        <div className="w-[72px] h-[72px] rounded-[20px] mx-auto mb-4 bg-gradient-to-br from-[#E8521A] to-[#F4A261] flex items-center justify-center text-4xl font-black text-white shadow-[0_8px_32px_rgba(232,82,26,0.4)]">
          L
        </div>
        <h1 className="text-4xl font-bold text-[#F0EDE8] font-serif">Lexi</h1>
        <p className="mt-2 text-[#7C7C8A] text-lg max-w-md mx-auto">
          Transforme n&apos;importe quel cours en expérience interactive
          accessible
        </p>
        <Link
          href="/upload"
          className="mt-8 inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-[#E8521A] to-[#F4A261] text-white font-bold text-lg shadow-[0_4px_20px_rgba(232,82,26,0.35)] hover:opacity-90 transition-opacity"
        >
          Commencer
        </Link>
      </div>
    </div>
  );
}
