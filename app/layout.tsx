import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lexi — Cours interactifs accessibles",
  description:
    "Transformez vos documents de cours en expériences interactives avec un mode dyslexie dédié.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Apply dyslexia class before first paint to prevent flash */}
        <Script id="dyslexia-flash-prevention" strategy="beforeInteractive">
          {`try{if(localStorage.getItem('lexi-dyslexia-mode')==='true'){document.documentElement.classList.add('dyslexia')}}catch(e){}`}
        </Script>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
