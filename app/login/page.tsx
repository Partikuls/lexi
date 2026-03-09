"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${searchParams.get("next") || "/dashboard"}`;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F13] to-[#1A1028] flex flex-col items-center justify-center p-4 md:p-6 font-serif">
      {/* Logo */}
      <div className="text-center mb-8 md:mb-12">
        <div className="w-14 h-14 md:w-[72px] md:h-[72px] rounded-2xl md:rounded-[20px] mx-auto mb-3 md:mb-4 bg-gradient-to-br from-[#E8521A] to-[#F4A261] flex items-center justify-center text-3xl md:text-4xl font-black text-white shadow-[0_8px_32px_rgba(232,82,26,0.4)]">
          L
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#F0EDE8]">Lexi</h1>
        <p className="mt-2 text-[#7C7C8A] text-sm md:text-base">
          Connectez-vous pour accéder à votre espace enseignant
        </p>
      </div>

      {/* Login card */}
      <div className="w-full max-w-[440px] bg-[#16161E] rounded-xl md:rounded-[20px] border border-[#2A2A35] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#0D2818] border border-[#059669] flex items-center justify-center mx-auto mb-4 text-2xl">
              ✉️
            </div>
            <h2 className="text-xl font-bold text-[#F0EDE8] mb-2">
              Vérifiez votre boîte mail
            </h2>
            <p className="text-[#7C7C8A] text-sm leading-relaxed">
              Un lien de connexion a été envoyé à{" "}
              <span className="text-[#F4A261] font-medium">{email}</span>.
              <br />
              Cliquez sur le lien pour vous connecter.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="mt-6 text-[#7C7C8A] text-sm underline underline-offset-2 hover:text-[#F0EDE8] transition-colors"
            >
              Utiliser une autre adresse
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold text-[#F0EDE8] mb-1">
              Connexion
            </h2>
            <p className="text-[#7C7C8A] text-sm mb-6">
              Entrez votre email pour recevoir un lien de connexion
            </p>

            <label htmlFor="email" className="block text-[#D4CFC8] text-sm mb-2">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="enseignant@ecole.fr"
              className="w-full bg-[#1A1A22] border border-[#2A2A35] rounded-xl px-4 py-3 text-[#D4CFC8] text-sm outline-none focus:border-[#E8521A] transition-colors placeholder:text-[#4A4A55]"
            />

            {error && (
              <div className="mt-3 p-3 rounded-lg bg-[#2A1010] border border-[#7F1D1D] text-[#FCA5A5] text-[13px]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className={`w-full mt-5 py-3.5 rounded-xl border-none font-bold text-base font-serif transition-all min-h-[48px] ${
                email.trim() && !loading
                  ? "bg-gradient-to-r from-[#E8521A] to-[#F4A261] text-white shadow-[0_4px_20px_rgba(232,82,26,0.35)] cursor-pointer hover:opacity-90"
                  : "bg-[#2A2A35] text-[#4A4A55] cursor-not-allowed"
              }`}
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien magique"}
            </button>
          </form>
        )}
      </div>

      {/* Back to home */}
      <a
        href="/"
        className="mt-6 text-[#7C7C8A] text-sm hover:text-[#F0EDE8] transition-colors"
      >
        ← Retour à l&apos;accueil
      </a>
    </div>
  );
}
