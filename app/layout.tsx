import type { Metadata } from "next";
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
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
