import { useState, useEffect, useRef } from "react";

// ── Données du cours de démonstration ──────────────────────────────────────
const COURSE = {
  title: "La Révolution française",
  subject: "Histoire",
  level: "4ème",
  duration: "45 min",
  objectives: [
    "Comprendre les causes de la Révolution française",
    "Identifier les grandes étapes de 1789",
    "Analyser le rôle du peuple dans ce bouleversement",
  ],
  sections: [
    {
      id: 1,
      title: "Contexte et causes",
      emoji: "⚡",
      color: "#E8521A",
      content: `La France de la fin du XVIIIe siècle traverse une crise profonde. Le roi Louis XVI règne sur un pays épuisé par les dettes et les inégalités sociales. La société est divisée en trois ordres : le clergé, la noblesse, et le Tiers-État qui représente 97% de la population mais supporte la quasi-totalité des impôts.`,
      dyslexiaContent: [
        "La France est en grande difficulté.",
        "Le roi s'appelle Louis XVI.",
        "La société est divisée en 3 groupes :",
        "→ Le clergé (les prêtres)",
        "→ La noblesse (les nobles)",
        "→ Le Tiers-État (tout le monde)",
        "Le Tiers-État = 97% des gens.",
        "Ils paient presque tous les impôts.",
      ],
      keyWords: [
        { word: "XVIIIe siècle", def: "Le 18ème siècle, entre 1700 et 1800" },
        { word: "Tiers-État", def: "Le troisième ordre de la société : artisans, paysans, bourgeois" },
        { word: "impôts", def: "Argent que les citoyens doivent payer à l'État" },
      ],
      quiz: [
        {
          q: "Quel pourcentage de la population représente le Tiers-État ?",
          options: ["50%", "75%", "97%", "100%"],
          answer: 2,
          explanation: "Le Tiers-État représentait 97% de la population française, mais avait très peu de droits politiques.",
        },
        {
          q: "Comment s'appelait le roi de France en 1789 ?",
          options: ["Louis XIV", "Louis XV", "Louis XVI", "Napoléon"],
          answer: 2,
          explanation: "Louis XVI était roi de France lors de la Révolution. Il sera guillotiné en 1793.",
        },
      ],
    },
    {
      id: 2,
      title: "La prise de la Bastille",
      emoji: "🏰",
      color: "#2563EB",
      content: `Le 14 juillet 1789, le peuple parisien prend d'assaut la forteresse de la Bastille, symbole de l'arbitraire royal. Cet événement marque symboliquement le début de la Révolution. La nouvelle se répand dans tout le pays, déclenchant des soulèvements en province — c'est la Grande Peur.`,
      dyslexiaContent: [
        "Le 14 juillet 1789.",
        "Le peuple attaque la Bastille.",
        "La Bastille = une prison symbole du roi.",
        "C'est le début de la Révolution !",
        "La nouvelle se répand en France.",
        "Le peuple se soulève partout.",
        "On appelle ça : la Grande Peur.",
      ],
      keyWords: [
        { word: "Bastille", def: "Forteresse-prison à Paris, symbole du pouvoir absolu du roi" },
        { word: "Grande Peur", def: "Soulèvement des paysans dans les campagnes françaises à l'été 1789" },
        { word: "arbitraire", def: "Décision prise sans règle ni justice, selon le seul bon vouloir du roi" },
      ],
      quiz: [
        {
          q: "Quelle date marque la prise de la Bastille ?",
          options: ["4 août 1789", "14 juillet 1789", "26 août 1789", "1er janvier 1790"],
          answer: 1,
          explanation: "Le 14 juillet 1789 est aujourd'hui la fête nationale française. C'est le symbole du début de la Révolution.",
        },
      ],
    },
    {
      id: 3,
      title: "La Déclaration des droits",
      emoji: "📜",
      color: "#059669",
      content: `Le 26 août 1789, l'Assemblée nationale adopte la Déclaration des Droits de l'Homme et du Citoyen. Ce texte fondamental proclame que "les hommes naissent et demeurent libres et égaux en droits". Il pose les bases d'une société nouvelle fondée sur la liberté, la propriété, la sûreté et la résistance à l'oppression.`,
      dyslexiaContent: [
        "Le 26 août 1789.",
        "Un texte très important est écrit.",
        "Il s'appelle : la Déclaration des Droits.",
        "Ce texte dit que :",
        "→ Tous les hommes sont libres.",
        "→ Tous les hommes sont égaux.",
        "4 droits importants :",
        "✓ La liberté",
        "✓ La propriété",
        "✓ La sûreté",
        "✓ La résistance à l'oppression",
      ],
      keyWords: [
        { word: "Déclaration", def: "Texte officiel qui proclame solennellement des principes importants" },
        { word: "oppression", def: "Action d'écraser quelqu'un par la force ou l'injustice" },
        { word: "Assemblée nationale", def: "Représentants du peuple réunis pour voter des lois" },
      ],
      quiz: [
        {
          q: "Quel est le principe fondamental de la Déclaration de 1789 ?",
          options: [
            "Les rois ont tous les droits",
            "Les hommes naissent libres et égaux",
            "Seuls les nobles ont des droits",
            "L'Église dirige la société",
          ],
          answer: 1,
          explanation: "La Déclaration pose le principe d'égalité naturelle entre tous les hommes — une rupture totale avec l'Ancien Régime.",
        },
      ],
    },
  ],
};

// ── Composant principal ────────────────────────────────────────────────────
export default function LexiApp() {
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [quizState, setQuizState] = useState({});
  const [hoveredWord, setHoveredWord] = useState(null);
  const [progress, setProgress] = useState({ 0: true });
  const [showObjectives, setShowObjectives] = useState(true);
  const [fontSize, setFontSize] = useState(1);
  const tooltipRef = useRef(null);

  const section = COURSE.sections[activeSection];

  const handleQuizAnswer = (secId, qIdx, ansIdx) => {
    const key = `${secId}-${qIdx}`;
    if (quizState[key]?.answered) return;
    setQuizState(prev => ({
      ...prev,
      [key]: { answered: true, selected: ansIdx, correct: ansIdx === section.quiz[qIdx].answer },
    }));
  };

  const goToSection = (idx) => {
    setActiveSection(idx);
    setProgress(prev => ({ ...prev, [idx]: true }));
  };

  const completedCount = Object.keys(progress).length;
  const totalSections = COURSE.sections.length;

  // ── Styles inline dynamiques ────────────────────────────────────────────
  const bodyFont = dyslexiaMode ? "'Trebuchet MS', sans-serif" : "'Georgia', serif";
  const lineHeight = dyslexiaMode ? 2.2 : 1.75;
  const letterSpacing = dyslexiaMode ? "0.08em" : "normal";
  const wordSpacing = dyslexiaMode ? "0.2em" : "normal";
  const baseFontSize = fontSize * (dyslexiaMode ? 1.15 : 1);

  return (
    <div style={{
      minHeight: "100vh",
      background: dyslexiaMode ? "#FFF8F0" : "#0F0F13",
      color: dyslexiaMode ? "#1a1a2e" : "#F0EDE8",
      fontFamily: bodyFont,
      transition: "all 0.4s ease",
    }}>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header style={{
        background: dyslexiaMode ? "#FFFFFF" : "#1A1A22",
        borderBottom: dyslexiaMode ? "3px solid #FFD166" : "1px solid #2A2A35",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: dyslexiaMode ? "0 2px 12px rgba(0,0,0,0.08)" : "0 2px 20px rgba(0,0,0,0.4)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: dyslexiaMode ? "#FFD166" : "#E8521A",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900,
          }}>L</div>
          <span style={{
            fontFamily: "'Georgia', serif",
            fontWeight: 700, fontSize: 20,
            color: dyslexiaMode ? "#1a1a2e" : "#F0EDE8",
          }}>Lexi</span>
          <span style={{
            fontSize: 11, padding: "2px 8px", borderRadius: 20,
            background: dyslexiaMode ? "#E8F4FD" : "#2A2A35",
            color: dyslexiaMode ? "#2563EB" : "#7C7C8A",
            fontFamily: "monospace",
          }}>{COURSE.level} • {COURSE.subject}</span>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Font size */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => setFontSize(f => Math.max(0.8, f - 0.1))} style={btnSmallStyle(dyslexiaMode)}>A−</button>
            <button onClick={() => setFontSize(f => Math.min(1.4, f + 0.1))} style={btnSmallStyle(dyslexiaMode)}>A+</button>
          </div>

          {/* Mode dyslexie toggle */}
          <button
            onClick={() => setDyslexiaMode(d => !d)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 24,
              border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 13,
              background: dyslexiaMode ? "#059669" : "#E8521A",
              color: "#fff",
              transition: "all 0.3s",
              boxShadow: dyslexiaMode ? "0 0 12px rgba(5,150,105,0.4)" : "0 0 12px rgba(232,82,26,0.4)",
            }}>
            {dyslexiaMode ? "✓ Mode dyslexie actif" : "◎ Mode dyslexie"}
          </button>
        </div>
      </header>

      <div style={{ display: "flex", maxWidth: 1100, margin: "0 auto" }}>

        {/* ── SIDEBAR ──────────────────────────────────────────── */}
        <aside style={{
          width: 260, flexShrink: 0,
          padding: "24px 16px",
          position: "sticky", top: 64, height: "calc(100vh - 64px)",
          overflowY: "auto",
          borderRight: dyslexiaMode ? "2px solid #F0E6D3" : "1px solid #1E1E28",
        }}>
          {/* Progress */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.5, marginBottom: 8 }}>
              Progression
            </div>
            <div style={{
              height: 6, borderRadius: 3,
              background: dyslexiaMode ? "#E8E0D5" : "#2A2A35",
            }}>
              <div style={{
                height: "100%", borderRadius: 3,
                width: `${(completedCount / totalSections) * 100}%`,
                background: dyslexiaMode ? "#059669" : "#E8521A",
                transition: "width 0.5s ease",
              }} />
            </div>
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.6 }}>
              {completedCount}/{totalSections} sections
            </div>
          </div>

          {/* Nav sections */}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.5, marginBottom: 12 }}>
            Sommaire
          </div>
          {COURSE.sections.map((s, i) => (
            <button key={s.id} onClick={() => goToSection(i)} style={{
              width: "100%", textAlign: "left",
              padding: "10px 12px", borderRadius: 10,
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 4,
              background: activeSection === i
                ? (dyslexiaMode ? "#FFF0D6" : "#1E1E28")
                : "transparent",
              color: activeSection === i
                ? (dyslexiaMode ? "#1a1a2e" : "#F0EDE8")
                : (dyslexiaMode ? "#4a4a6a" : "#7C7C8A"),
              borderLeft: activeSection === i ? `3px solid ${s.color}` : "3px solid transparent",
              transition: "all 0.2s",
              fontSize: 13 * baseFontSize,
            }}>
              <span>{s.emoji}</span>
              <span style={{ fontWeight: activeSection === i ? 700 : 400 }}>{s.title}</span>
              {progress[i] && (
                <span style={{ marginLeft: "auto", fontSize: 10, color: "#059669" }}>✓</span>
              )}
            </button>
          ))}

          {/* Objectifs */}
          <div style={{ marginTop: 24, padding: 12, borderRadius: 10, background: dyslexiaMode ? "#F0F7FF" : "#1A1A22" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, marginBottom: 8 }}>
              Objectifs
            </div>
            {COURSE.objectives.map((obj, i) => (
              <div key={i} style={{ fontSize: 12 * baseFontSize, marginBottom: 6, display: "flex", gap: 6, lineHeight: 1.4 }}>
                <span style={{ color: "#059669", flexShrink: 0 }}>→</span>
                <span style={{ opacity: 0.8 }}>{obj}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────── */}
        <main style={{ flex: 1, padding: "32px 40px", minWidth: 0 }}>

          {/* Section header */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 32,
            paddingBottom: 24,
            borderBottom: dyslexiaMode ? "2px solid #F0E6D3" : "1px solid #1E1E28",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, flexShrink: 0,
              background: section.color + "22",
              border: `2px solid ${section.color}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28,
            }}>{section.emoji}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: section.color, marginBottom: 4 }}>
                Section {activeSection + 1} / {totalSections}
              </div>
              <h1 style={{
                margin: 0, fontSize: (dyslexiaMode ? 26 : 28) * baseFontSize,
                fontFamily: dyslexiaMode ? "'Trebuchet MS', sans-serif" : "'Georgia', serif",
                fontWeight: 800, lineHeight: 1.2,
              }}>{section.title}</h1>
            </div>
          </div>

          {/* Contenu texte */}
          <div style={{
            background: dyslexiaMode ? "#FFFFFF" : "#16161E",
            borderRadius: 16, padding: "28px 32px",
            marginBottom: 28,
            border: dyslexiaMode ? "2px solid #F0E6D3" : "1px solid #1E1E28",
            boxShadow: dyslexiaMode ? "0 4px 20px rgba(0,0,0,0.06)" : "none",
          }}>
            {dyslexiaMode ? (
              // Mode dyslexie : lignes alternées colorées
              <div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 20,
                  padding: "8px 14px", borderRadius: 8,
                  background: "#E8F8F0", fontSize: 12, color: "#059669", fontWeight: 700,
                }}>
                  ✓ Mode dyslexie activé — texte simplifié et structuré
                </div>
                {section.dyslexiaContent.map((line, i) => (
                  <div key={i} style={{
                    padding: "6px 12px", borderRadius: 6, marginBottom: 3,
                    background: i % 2 === 0 ? "#FFFDF5" : "#F5F8FF",
                    borderLeft: `3px solid ${i % 2 === 0 ? "#FFD166" : "#93C5FD"}`,
                    fontSize: 17 * baseFontSize,
                    fontFamily: "'Trebuchet MS', sans-serif",
                    lineHeight, letterSpacing, wordSpacing,
                    color: "#1a1a2e",
                  }}>{line}</div>
                ))}
              </div>
            ) : (
              // Mode standard : texte fluide avec mots-clés
              <p style={{
                margin: 0, fontSize: 16 * baseFontSize, lineHeight,
                color: "#D4CFC8",
              }}>
                {renderWithKeywords(section.content, section.keyWords, hoveredWord, setHoveredWord, dyslexiaMode, tooltipRef)}
              </p>
            )}
          </div>

          {/* Mots-clés */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{
              margin: "0 0 14px",
              fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", opacity: 0.5,
            }}>Vocabulaire clé</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {section.keyWords.map((kw, i) => (
                <div key={i} style={{
                  padding: "10px 16px", borderRadius: 10,
                  background: dyslexiaMode ? "#FFF8E8" : "#1A1A22",
                  border: dyslexiaMode ? "2px solid #FFD166" : "1px solid #2A2A35",
                  fontSize: 14 * baseFontSize,
                }}>
                  <span style={{ fontWeight: 800, color: section.color }}>{kw.word}</span>
                  <span style={{ opacity: 0.6, marginLeft: 8, fontSize: 13 * baseFontSize }}>— {kw.def}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── QUIZ ─────────────────────────────────────────────── */}
          <div style={{
            background: dyslexiaMode ? "#F0F7FF" : "#12121A",
            borderRadius: 16, padding: "28px 32px",
            border: dyslexiaMode ? "2px solid #BFDBFE" : "1px solid #1E1E28",
          }}>
            <h3 style={{
              margin: "0 0 20px", fontSize: 14, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: dyslexiaMode ? "#2563EB" : "#60A5FA",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              ✎ Questions de compréhension
            </h3>
            {section.quiz.map((q, qi) => {
              const key = `${section.id}-${qi}`;
              const state = quizState[key];
              return (
                <div key={qi} style={{ marginBottom: qi < section.quiz.length - 1 ? 28 : 0 }}>
                  <div style={{
                    fontSize: (dyslexiaMode ? 17 : 15) * baseFontSize,
                    fontWeight: dyslexiaMode ? 700 : 600,
                    marginBottom: 14, lineHeight: 1.5,
                    letterSpacing: dyslexiaMode ? letterSpacing : "normal",
                  }}>{q.q}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {q.options.map((opt, oi) => {
                      const isSelected = state?.selected === oi;
                      const isCorrect = oi === q.answer;
                      const showResult = state?.answered;
                      let bg = dyslexiaMode ? "#FFFFFF" : "#1A1A22";
                      let border = dyslexiaMode ? "#E2D9F3" : "#2A2A35";
                      let textColor = dyslexiaMode ? "#1a1a2e" : "#D4CFC8";
                      if (showResult && isCorrect) { bg = "#E8F8F0"; border = "#059669"; textColor = "#065F46"; }
                      if (showResult && isSelected && !isCorrect) { bg = "#FEE8E8"; border = "#DC2626"; textColor = "#7F1D1D"; }
                      return (
                        <button key={oi} onClick={() => handleQuizAnswer(section.id, qi, oi)} style={{
                          padding: "12px 16px", borderRadius: 10,
                          border: `2px solid ${border}`,
                          background: bg, color: textColor,
                          textAlign: "left", cursor: state?.answered ? "default" : "pointer",
                          fontSize: (dyslexiaMode ? 16 : 14) * baseFontSize,
                          fontWeight: isSelected ? 700 : 400,
                          letterSpacing: dyslexiaMode ? letterSpacing : "normal",
                          lineHeight: dyslexiaMode ? lineHeight : 1.5,
                          transition: "all 0.2s",
                          display: "flex", alignItems: "center", gap: 10,
                          fontFamily: bodyFont,
                        }}>
                          <span style={{
                            width: 24, height: 24, borderRadius: "50%",
                            border: `2px solid ${border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, flexShrink: 0, fontWeight: 700,
                          }}>
                            {showResult && isCorrect ? "✓" : showResult && isSelected ? "✗" : String.fromCharCode(65 + oi)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {state?.answered && (
                    <div style={{
                      marginTop: 12, padding: "12px 16px", borderRadius: 10,
                      background: state.correct ? "#E8F8F0" : "#FEF3C7",
                      border: `1px solid ${state.correct ? "#059669" : "#D97706"}`,
                      fontSize: 13 * baseFontSize, lineHeight: 1.5,
                      color: state.correct ? "#065F46" : "#92400E",
                    }}>
                      <strong>{state.correct ? "✓ Correct !" : "⚠ Pas tout à fait."}</strong>{" "}
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
            <button
              onClick={() => activeSection > 0 && goToSection(activeSection - 1)}
              disabled={activeSection === 0}
              style={navBtnStyle(dyslexiaMode, activeSection === 0, false, section.color)}
            >← Précédent</button>
            <button
              onClick={() => activeSection < COURSE.sections.length - 1 && goToSection(activeSection + 1)}
              disabled={activeSection === COURSE.sections.length - 1}
              style={navBtnStyle(dyslexiaMode, activeSection === COURSE.sections.length - 1, true, section.color)}
            >Suivant →</button>
          </div>

          {/* Fin de cours */}
          {completedCount === totalSections && (
            <div style={{
              marginTop: 32, padding: 28, borderRadius: 16, textAlign: "center",
              background: dyslexiaMode ? "#E8F8F0" : "#0D1F17",
              border: `2px solid #059669`,
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <h3 style={{ margin: "0 0 8px", color: "#059669", fontSize: 20 * baseFontSize }}>
                Cours terminé !
              </h3>
              <p style={{ margin: 0, opacity: 0.7, fontSize: 14 * baseFontSize }}>
                Tu as parcouru les {totalSections} sections de ce cours sur la Révolution française.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function renderWithKeywords(text, keywords, hoveredWord, setHoveredWord, dyslexiaMode) {
  const parts = [];
  let remaining = text;
  keywords.forEach(kw => {
    const idx = remaining.indexOf(kw.word);
    if (idx !== -1) {
      if (idx > 0) parts.push({ type: "text", content: remaining.slice(0, idx) });
      parts.push({ type: "keyword", content: kw.word, def: kw.def });
      remaining = remaining.slice(idx + kw.word.length);
    }
  });
  if (remaining) parts.push({ type: "text", content: remaining });

  return parts.map((p, i) =>
    p.type === "keyword" ? (
      <span key={i} style={{ position: "relative", display: "inline" }}>
        <span
          onMouseEnter={() => setHoveredWord(p.content)}
          onMouseLeave={() => setHoveredWord(null)}
          style={{
            borderBottom: "2px dashed #E8521A", cursor: "help",
            color: "#F4A261", fontWeight: 600,
          }}>{p.content}</span>
        {hoveredWord === p.content && (
          <span style={{
            position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
            transform: "translateX(-50%)",
            background: "#1A1A22", color: "#F0EDE8",
            padding: "8px 12px", borderRadius: 8, fontSize: 13,
            width: 200, textAlign: "center", lineHeight: 1.4,
            border: "1px solid #2A2A35",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            zIndex: 200, pointerEvents: "none",
          }}>{p.def}</span>
        )}
      </span>
    ) : (
      <span key={i}>{p.content}</span>
    )
  );
}

function btnSmallStyle(dyslexiaMode) {
  return {
    padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer",
    background: dyslexiaMode ? "#F0E6D3" : "#2A2A35",
    color: dyslexiaMode ? "#1a1a2e" : "#F0EDE8",
    fontWeight: 700, fontSize: 12,
  };
}

function navBtnStyle(dyslexiaMode, disabled, isPrimary, color) {
  return {
    padding: "12px 24px", borderRadius: 10, border: "none", cursor: disabled ? "default" : "pointer",
    background: disabled ? (dyslexiaMode ? "#E8E0D5" : "#1A1A22") : (isPrimary ? color : (dyslexiaMode ? "#F0E6D3" : "#2A2A35")),
    color: disabled ? (dyslexiaMode ? "#A09080" : "#4A4A55") : (isPrimary ? "#fff" : (dyslexiaMode ? "#1a1a2e" : "#F0EDE8")),
    fontWeight: 700, fontSize: 14,
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.2s",
  };
}
