import { useState, useRef } from "react";

// ─── SYSTEM PROMPT de l'agent ─────────────────────────────────────────────
const AGENT_SYSTEM_PROMPT = `Tu es Lexi, un agent pédagogique spécialisé dans la transformation de cours scolaires.
Tu reçois un cours brut (texte, Word exporté, etc.) et tu dois produire un JSON structuré strict.

RÈGLES ABSOLUES :
- Répondre UNIQUEMENT avec du JSON valide, aucun texte avant ou après
- Jamais de markdown, jamais de backticks
- Le JSON doit être parseable directement

STRUCTURE JSON REQUISE :
{
  "title": "string",
  "subject": "string (matière)",
  "level": "string (ex: 4ème, CE2, Terminale)",
  "duration": "string (ex: 45 min)",
  "objectives": ["string", "string", "string"],
  "sections": [
    {
      "id": number,
      "title": "string (titre court)",
      "emoji": "string (1 emoji représentatif)",
      "color": "string (code hex)",
      "content": "string (paragraphe fluide, 3-5 phrases, mode standard)",
      "dyslexiaContent": ["string (ligne courte)", "..."],
      "keyWords": [
        { "word": "string", "def": "string (définition simple)" }
      ],
      "quiz": [
        {
          "q": "string (question)",
          "options": ["A", "B", "C", "D"],
          "answer": number (index 0-3),
          "explanation": "string (explication pédagogique)"
        }
      ]
    }
  ]
}

RÈGLES DE TRANSFORMATION :
1. Découper le cours en 2 à 4 sections logiques
2. Pour dyslexiaContent : phrases de max 10 mots, une idée par ligne, utiliser → et ✓ pour structurer
3. Pour keyWords : 2-3 mots clés par section, définitions simples et accessibles
4. Pour quiz : 1-2 questions par section, 4 options, 1 seule bonne réponse
5. Colors : utiliser des couleurs distinctes par section (#E8521A, #2563EB, #059669, #7C3AED)
6. Emojis : choisir des emojis visuellement représentatifs du contenu
7. Objectifs : 3 objectifs pédagogiques concrets commençant par un verbe d'action`;

// ─── EXEMPLE de cours brut pour la démo ──────────────────────────────────
const DEMO_COURSE = `La photosynthèse - Sciences de la vie et de la Terre - 5ème

La photosynthèse est le processus par lequel les plantes vertes fabriquent leur propre nourriture à partir de la lumière solaire. Ce mécanisme fondamental se déroule dans les chloroplastes, des organites présents dans les cellules végétales contenant un pigment vert appelé chlorophylle.

Pour réaliser la photosynthèse, la plante a besoin de trois éléments : la lumière (principalement solaire), le dioxyde de carbone (CO2) absorbé par les stomates des feuilles, et l'eau (H2O) puisée dans le sol par les racines.

La réaction produit du glucose, un sucre que la plante utilise comme source d'énergie pour croître, et du dioxygène (O2) qui est rejeté dans l'atmosphère. C'est ainsi que les plantes sont à la base de la chaîne alimentaire et jouent un rôle essentiel dans l'équilibre de notre atmosphère.

On peut résumer la photosynthèse par l'équation : 6CO2 + 6H2O + lumière → C6H12O6 + 6O2`;

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────
export default function LexiAgent() {
  const [phase, setPhase] = useState("input"); // input | processing | result
  const [inputText, setInputText] = useState("");
  const [processingStep, setProcessingStep] = useState(0);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [quizState, setQuizState] = useState({});
  const [hoveredWord, setHoveredWord] = useState(null);
  const [fontSize, setFontSize] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  // ── Steps de processing ───────────────────────────────────────────────
  const STEPS = [
    { icon: "📄", label: "Lecture du document" },
    { icon: "🧠", label: "Analyse pédagogique" },
    { icon: "✂️", label: "Découpage en sections" },
    { icon: "♿", label: "Adaptation dyslexie" },
    { icon: "❓", label: "Génération des quiz" },
    { icon: "✅", label: "Finalisation du cours" },
  ];

  // ── Appel API Claude ──────────────────────────────────────────────────
  const transformCourse = async (text) => {
    setPhase("processing");
    setProcessingStep(0);
    setError(null);

    // Simulation des étapes visuelles
    for (let i = 0; i < STEPS.length - 1; i++) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      setProcessingStep(i + 1);
    }

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: AGENT_SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Transforme ce cours en JSON structuré :\n\n${text}` }],
        }),
      });

      const data = await res.json();
      const raw = data.content?.[0]?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setProcessingStep(STEPS.length - 1);
      await new Promise(r => setTimeout(r, 500));
      setCourse(parsed);
      setPhase("result");
    } catch (e) {
      setError("Erreur lors de la transformation. Vérifie le format du cours.");
      setPhase("input");
    }
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => setInputText(e.target.result);
    reader.readAsText(file);
  };

  const handleQuiz = (secId, qi, ansIdx) => {
    const key = `${secId}-${qi}`;
    if (quizState[key]?.answered) return;
    const sec = course.sections.find(s => s.id === secId);
    setQuizState(p => ({
      ...p,
      [key]: { answered: true, selected: ansIdx, correct: ansIdx === sec.quiz[qi].answer },
    }));
  };

  const reset = () => {
    setPhase("input"); setCourse(null); setInputText("");
    setQuizState({}); setActiveSection(0); setDyslexiaMode(false);
  };

  // ─────────────────────────────────────────────────────────────────────
  // PHASE INPUT
  // ─────────────────────────────────────────────────────────────────────
  if (phase === "input") return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0F0F13 0%, #1A1028 100%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 24, fontFamily: "'Georgia', serif",
    }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: "0 auto 16px",
          background: "linear-gradient(135deg, #E8521A, #F4A261)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, fontWeight: 900, color: "#fff",
          boxShadow: "0 8px 32px rgba(232,82,26,0.4)",
        }}>L</div>
        <h1 style={{ margin: 0, fontSize: 36, color: "#F0EDE8", fontWeight: 800 }}>Lexi</h1>
        <p style={{ margin: "8px 0 0", color: "#7C7C8A", fontSize: 16 }}>
          Transforme n'importe quel cours en expérience interactive
        </p>
      </div>

      {/* Zone principale */}
      <div style={{
        width: "100%", maxWidth: 640,
        background: "#16161E", borderRadius: 20,
        border: "1px solid #2A2A35",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current.click()}
          style={{
            margin: 24, borderRadius: 12,
            border: `2px dashed ${dragOver ? "#E8521A" : "#2A2A35"}`,
            padding: "20px 24px",
            display: "flex", alignItems: "center", gap: 16,
            cursor: "pointer",
            background: dragOver ? "rgba(232,82,26,0.05)" : "transparent",
            transition: "all 0.2s",
          }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, flexShrink: 0,
            background: "#1E1E28",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>📄</div>
          <div>
            <div style={{ color: "#F0EDE8", fontWeight: 600, fontSize: 14 }}>
              Glisser un fichier Word / PDF
            </div>
            <div style={{ color: "#7C7C8A", fontSize: 12, marginTop: 2 }}>
              ou cliquer pour parcourir
            </div>
          </div>
          <input ref={fileRef} type="file" accept=".txt,.doc,.docx,.pdf" style={{ display: "none" }}
            onChange={e => handleFile(e.target.files[0])} />
        </div>

        <div style={{ textAlign: "center", color: "#4A4A55", fontSize: 13, marginTop: -8, marginBottom: 8 }}>ou</div>

        {/* Textarea */}
        <div style={{ padding: "0 24px 24px" }}>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Coller le contenu du cours ici..."
            style={{
              width: "100%", minHeight: 180,
              background: "#1A1A22", border: "1px solid #2A2A35",
              borderRadius: 12, padding: 16, resize: "vertical",
              color: "#D4CFC8", fontSize: 14, lineHeight: 1.6,
              fontFamily: "monospace", outline: "none",
              boxSizing: "border-box",
            }} />

          {/* Demo button */}
          <button onClick={() => setInputText(DEMO_COURSE)} style={{
            marginTop: 8, padding: "6px 14px", borderRadius: 8,
            border: "1px solid #2A2A35", background: "transparent",
            color: "#7C7C8A", fontSize: 12, cursor: "pointer",
          }}>
            ✦ Charger le cours de démo
          </button>

          {error && (
            <div style={{
              marginTop: 12, padding: "10px 14px", borderRadius: 8,
              background: "#2A1010", border: "1px solid #7F1D1D",
              color: "#FCA5A5", fontSize: 13,
            }}>{error}</div>
          )}

          {/* CTA */}
          <button
            onClick={() => inputText.trim() && transformCourse(inputText)}
            disabled={!inputText.trim()}
            style={{
              width: "100%", marginTop: 16, padding: "16px",
              borderRadius: 12, border: "none", cursor: inputText.trim() ? "pointer" : "not-allowed",
              background: inputText.trim()
                ? "linear-gradient(135deg, #E8521A, #F4A261)"
                : "#2A2A35",
              color: inputText.trim() ? "#fff" : "#4A4A55",
              fontSize: 16, fontWeight: 800,
              boxShadow: inputText.trim() ? "0 4px 20px rgba(232,82,26,0.35)" : "none",
              transition: "all 0.2s",
              fontFamily: "'Georgia', serif",
            }}>
            {inputText.trim() ? "✦ Transformer en cours interactif" : "Ajoute un cours pour commencer"}
          </button>
        </div>
      </div>

      {/* Features */}
      <div style={{ display: "flex", gap: 16, marginTop: 32, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { icon: "🧠", label: "Structuration IA" },
          { icon: "♿", label: "Mode dyslexie" },
          { icon: "❓", label: "Quiz génératifs" },
          { icon: "📖", label: "Mots-clés définis" },
        ].map((f, i) => (
          <div key={i} style={{
            padding: "8px 16px", borderRadius: 20,
            background: "#16161E", border: "1px solid #2A2A35",
            color: "#7C7C8A", fontSize: 13,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {f.icon} {f.label}
          </div>
        ))}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────
  // PHASE PROCESSING
  // ─────────────────────────────────────────────────────────────────────
  if (phase === "processing") return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0F0F13 0%, #1A1028 100%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 24, fontFamily: "'Georgia', serif",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20, margin: "0 auto 32px",
        background: "linear-gradient(135deg, #E8521A, #F4A261)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 36, fontWeight: 900, color: "#fff",
        animation: "pulse 1.5s ease-in-out infinite",
        boxShadow: "0 8px 32px rgba(232,82,26,0.4)",
      }}>L</div>

      <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:0.85} }`}</style>

      <h2 style={{ color: "#F0EDE8", margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>
        Transformation en cours…
      </h2>
      <p style={{ color: "#7C7C8A", margin: "0 0 40px", fontSize: 14 }}>
        L'agent analyse et restructure votre cours
      </p>

      <div style={{ width: "100%", maxWidth: 420 }}>
        {STEPS.map((step, i) => {
          const done = i < processingStep;
          const active = i === processingStep;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "12px 16px", borderRadius: 12, marginBottom: 6,
              background: active ? "#1E1228" : done ? "#131318" : "transparent",
              border: active ? "1px solid #7C3AED44" : "1px solid transparent",
              transition: "all 0.4s",
              opacity: i > processingStep ? 0.3 : 1,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: done ? "#059669" : active ? "#7C3AED" : "#1E1E28",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: done ? 16 : 20,
                transition: "all 0.3s",
              }}>
                {done ? "✓" : step.icon}
              </div>
              <span style={{
                color: done ? "#6EE7B7" : active ? "#DDD6FE" : "#7C7C8A",
                fontWeight: active ? 700 : 400, fontSize: 14,
                transition: "all 0.3s",
              }}>
                {step.label}
              </span>
              {active && (
                <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
                  {[0,1,2].map(d => (
                    <div key={d} style={{
                      width: 5, height: 5, borderRadius: "50%", background: "#7C3AED",
                      animation: `bounce 1s ease-in-out ${d * 0.15}s infinite`,
                    }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────
  // PHASE RESULT — cours interactif complet
  // ─────────────────────────────────────────────────────────────────────
  if (!course) return null;
  const sec = course.sections[activeSection] || course.sections[0];
  const bf = dyslexiaMode ? "'Trebuchet MS', sans-serif" : "'Georgia', serif";
  const lh = dyslexiaMode ? 2.2 : 1.75;
  const ls = dyslexiaMode ? "0.07em" : "normal";
  const fs = fontSize * (dyslexiaMode ? 1.12 : 1);

  return (
    <div style={{
      minHeight: "100vh",
      background: dyslexiaMode ? "#FFF8F0" : "#0F0F13",
      color: dyslexiaMode ? "#1a1a2e" : "#F0EDE8",
      fontFamily: bf, transition: "all 0.4s",
    }}>
      {/* ── TOPBAR ── */}
      <header style={{
        background: dyslexiaMode ? "#fff" : "#1A1A22",
        borderBottom: dyslexiaMode ? "3px solid #FFD166" : "1px solid #2A2A35",
        padding: "0 20px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: dyslexiaMode ? "0 2px 12px rgba(0,0,0,0.07)" : "0 2px 20px rgba(0,0,0,0.4)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={reset} style={{
            width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
            background: dyslexiaMode ? "#F0E6D3" : "#2A2A35",
            color: dyslexiaMode ? "#1a1a2e" : "#F0EDE8", fontSize: 14,
          }}>←</button>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #E8521A, #F4A261)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color: "#fff",
          }}>L</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{course.title}</div>
            <div style={{ fontSize: 11, opacity: 0.5 }}>{course.subject} · {course.level} · {course.duration}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setFontSize(f => Math.max(0.8, f - 0.1))} style={smallBtn(dyslexiaMode)}>A−</button>
          <button onClick={() => setFontSize(f => Math.min(1.4, f + 0.1))} style={smallBtn(dyslexiaMode)}>A+</button>
          <button onClick={() => setDyslexiaMode(d => !d)} style={{
            padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer",
            background: dyslexiaMode ? "#059669" : "#E8521A",
            color: "#fff", fontWeight: 700, fontSize: 12,
            boxShadow: `0 0 12px ${dyslexiaMode ? "rgba(5,150,105,0.35)" : "rgba(232,82,26,0.35)"}`,
          }}>
            {dyslexiaMode ? "✓ Dyslexie ON" : "◎ Mode dyslexie"}
          </button>
        </div>
      </header>

      <div style={{ display: "flex", maxWidth: 1080, margin: "0 auto" }}>
        {/* ── SIDEBAR ── */}
        <aside style={{
          width: 240, flexShrink: 0, padding: "20px 14px",
          position: "sticky", top: 60, height: "calc(100vh - 60px)", overflowY: "auto",
          borderRight: dyslexiaMode ? "2px solid #F0E6D3" : "1px solid #1E1E28",
        }}>
          {/* Progression */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.4, marginBottom: 6 }}>Progression</div>
            <div style={{ height: 5, borderRadius: 3, background: dyslexiaMode ? "#E8E0D5" : "#2A2A35" }}>
              <div style={{
                height: "100%", borderRadius: 3,
                width: `${((activeSection + 1) / course.sections.length) * 100}%`,
                background: dyslexiaMode ? "#059669" : "#E8521A",
                transition: "width 0.5s",
              }} />
            </div>
            <div style={{ fontSize: 11, marginTop: 4, opacity: 0.5 }}>
              {activeSection + 1}/{course.sections.length} sections
            </div>
          </div>

          {/* Nav */}
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.4, marginBottom: 10 }}>Sommaire</div>
          {course.sections.map((s, i) => (
            <button key={s.id} onClick={() => setActiveSection(i)} style={{
              width: "100%", textAlign: "left", padding: "9px 10px", borderRadius: 9,
              border: "none", cursor: "pointer", marginBottom: 3,
              display: "flex", alignItems: "center", gap: 8,
              background: activeSection === i ? (dyslexiaMode ? "#FFF0D6" : "#1E1E28") : "transparent",
              color: activeSection === i ? (dyslexiaMode ? "#1a1a2e" : "#F0EDE8") : (dyslexiaMode ? "#5a5a7a" : "#7C7C8A"),
              borderLeft: `3px solid ${activeSection === i ? s.color : "transparent"}`,
              fontSize: 12 * fs, fontFamily: bf,
            }}>
              <span>{s.emoji}</span>
              <span style={{ fontWeight: activeSection === i ? 700 : 400 }}>{s.title}</span>
            </button>
          ))}

          {/* Objectifs */}
          <div style={{
            marginTop: 20, padding: 12, borderRadius: 10,
            background: dyslexiaMode ? "#F0F7FF" : "#16161E",
            border: dyslexiaMode ? "1px solid #BFDBFE" : "1px solid #1E1E28",
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, marginBottom: 8 }}>Objectifs</div>
            {course.objectives?.map((o, i) => (
              <div key={i} style={{ fontSize: 11 * fs, marginBottom: 5, display: "flex", gap: 5, lineHeight: 1.4, opacity: 0.7 }}>
                <span style={{ color: "#059669" }}>→</span><span>{o}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── CONTENU PRINCIPAL ── */}
        <main style={{ flex: 1, padding: "28px 36px", minWidth: 0 }}>
          {/* Header section */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 28,
            paddingBottom: 20, borderBottom: dyslexiaMode ? "2px solid #F0E6D3" : "1px solid #1E1E28",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: sec.color + "22", border: `2px solid ${sec.color}44`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
            }}>{sec.emoji}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: sec.color, marginBottom: 3 }}>
                Section {activeSection + 1} / {course.sections.length}
              </div>
              <h1 style={{ margin: 0, fontSize: 24 * fs, fontWeight: 800, lineHeight: 1.2 }}>{sec.title}</h1>
            </div>
          </div>

          {/* Texte principal */}
          <div style={{
            background: dyslexiaMode ? "#FFFFFF" : "#16161E",
            borderRadius: 14, padding: "24px 28px", marginBottom: 24,
            border: dyslexiaMode ? "2px solid #F0E6D3" : "1px solid #1E1E28",
            boxShadow: dyslexiaMode ? "0 4px 20px rgba(0,0,0,0.05)" : "none",
          }}>
            {dyslexiaMode ? (
              <div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 18,
                  padding: "7px 12px", borderRadius: 8,
                  background: "#E8F8F0", fontSize: 12, color: "#059669", fontWeight: 700,
                }}>
                  ✓ Mode dyslexie — texte simplifié ligne par ligne
                </div>
                {(sec.dyslexiaContent || []).map((line, i) => (
                  <div key={i} style={{
                    padding: "5px 12px", borderRadius: 6, marginBottom: 3,
                    background: i % 2 === 0 ? "#FFFDF5" : "#F5F8FF",
                    borderLeft: `3px solid ${i % 2 === 0 ? "#FFD166" : "#93C5FD"}`,
                    fontSize: 16 * fs, fontFamily: bf,
                    lineHeight: lh, letterSpacing: ls, color: "#1a1a2e",
                  }}>{line}</div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 15 * fs, lineHeight: lh, color: "#D4CFC8" }}>
                {renderKeywords(sec.content, sec.keyWords || [], hoveredWord, setHoveredWord)}
              </p>
            )}
          </div>

          {/* Mots-clés */}
          {sec.keyWords?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.5 }}>
                Vocabulaire clé
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {sec.keyWords.map((kw, i) => (
                  <div key={i} style={{
                    padding: "9px 14px", borderRadius: 9,
                    background: dyslexiaMode ? "#FFF8E8" : "#1A1A22",
                    border: dyslexiaMode ? "2px solid #FFD166" : "1px solid #2A2A35",
                    fontSize: 13 * fs,
                  }}>
                    <span style={{ fontWeight: 800, color: sec.color }}>{kw.word}</span>
                    <span style={{ opacity: 0.6, marginLeft: 8, fontSize: 12 * fs }}>— {kw.def}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz */}
          {sec.quiz?.length > 0 && (
            <div style={{
              background: dyslexiaMode ? "#F0F7FF" : "#12121A",
              borderRadius: 14, padding: "24px 28px",
              border: dyslexiaMode ? "2px solid #BFDBFE" : "1px solid #1E1E28",
            }}>
              <h3 style={{
                margin: "0 0 18px", fontSize: 12, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: dyslexiaMode ? "#2563EB" : "#60A5FA",
              }}>✎ Questions de compréhension</h3>

              {sec.quiz.map((q, qi) => {
                const key = `${sec.id}-${qi}`;
                const st = quizState[key];
                return (
                  <div key={qi} style={{ marginBottom: qi < sec.quiz.length - 1 ? 24 : 0 }}>
                    <div style={{
                      fontSize: (dyslexiaMode ? 16 : 14) * fs, fontWeight: dyslexiaMode ? 700 : 600,
                      marginBottom: 12, lineHeight: 1.5, letterSpacing: dyslexiaMode ? ls : "normal",
                    }}>{q.q}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {q.options.map((opt, oi) => {
                        const sel = st?.selected === oi;
                        const correct = oi === q.answer;
                        const shown = st?.answered;
                        let bg = dyslexiaMode ? "#fff" : "#1A1A22";
                        let border = dyslexiaMode ? "#E2D9F3" : "#2A2A35";
                        let col = dyslexiaMode ? "#1a1a2e" : "#D4CFC8";
                        if (shown && correct) { bg = "#E8F8F0"; border = "#059669"; col = "#065F46"; }
                        if (shown && sel && !correct) { bg = "#FEE8E8"; border = "#DC2626"; col = "#7F1D1D"; }
                        return (
                          <button key={oi} onClick={() => handleQuiz(sec.id, qi, oi)} style={{
                            padding: "11px 14px", borderRadius: 9,
                            border: `2px solid ${border}`,
                            background: bg, color: col, textAlign: "left",
                            cursor: st?.answered ? "default" : "pointer",
                            fontSize: (dyslexiaMode ? 15 : 13) * fs,
                            fontWeight: sel ? 700 : 400, fontFamily: bf,
                            lineHeight: dyslexiaMode ? lh : 1.5,
                            letterSpacing: dyslexiaMode ? ls : "normal",
                            display: "flex", alignItems: "center", gap: 8,
                            transition: "all 0.2s",
                          }}>
                            <span style={{
                              width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                              border: `2px solid ${border}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, fontWeight: 700,
                            }}>
                              {shown && correct ? "✓" : shown && sel ? "✗" : String.fromCharCode(65 + oi)}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {st?.answered && (
                      <div style={{
                        marginTop: 10, padding: "10px 14px", borderRadius: 9,
                        background: st.correct ? "#E8F8F0" : "#FEF3C7",
                        border: `1px solid ${st.correct ? "#059669" : "#D97706"}`,
                        fontSize: 13 * fs, lineHeight: 1.5,
                        color: st.correct ? "#065F46" : "#92400E",
                      }}>
                        <strong>{st.correct ? "✓ Correct !" : "⚠ Pas tout à fait."}</strong>{" "}{q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Nav bas */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
            <button
              onClick={() => activeSection > 0 && setActiveSection(a => a - 1)}
              disabled={activeSection === 0}
              style={navBtn(dyslexiaMode, activeSection === 0, false, sec.color)}>← Précédent</button>
            <button
              onClick={() => activeSection < course.sections.length - 1 && setActiveSection(a => a + 1)}
              disabled={activeSection === course.sections.length - 1}
              style={navBtn(dyslexiaMode, activeSection === course.sections.length - 1, true, sec.color)}>Suivant →</button>
          </div>

          {/* Fin */}
          {activeSection === course.sections.length - 1 && (
            <div style={{
              marginTop: 28, padding: 24, borderRadius: 14, textAlign: "center",
              background: dyslexiaMode ? "#E8F8F0" : "#0D1F17",
              border: "2px solid #059669",
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
              <h3 style={{ margin: "0 0 6px", color: "#059669", fontSize: 18 * fs }}>Cours terminé !</h3>
              <p style={{ margin: "0 0 16px", opacity: 0.7, fontSize: 13 * fs }}>
                Tu as parcouru les {course.sections.length} sections de ce cours.
              </p>
              <button onClick={reset} style={{
                padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer",
                background: "#E8521A", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: bf,
              }}>
                ✦ Transformer un nouveau cours
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function renderKeywords(text, keywords, hoveredWord, setHoveredWord) {
  if (!text || !keywords.length) return text;
  const parts = [];
  let remaining = text;
  keywords.forEach(kw => {
    const idx = remaining.indexOf(kw.word);
    if (idx !== -1) {
      if (idx > 0) parts.push({ type: "text", content: remaining.slice(0, idx) });
      parts.push({ type: "kw", content: kw.word, def: kw.def });
      remaining = remaining.slice(idx + kw.word.length);
    }
  });
  if (remaining) parts.push({ type: "text", content: remaining });
  return parts.map((p, i) =>
    p.type === "kw" ? (
      <span key={i} style={{ position: "relative" }}>
        <span onMouseEnter={() => setHoveredWord(p.content)} onMouseLeave={() => setHoveredWord(null)}
          style={{ borderBottom: "2px dashed #E8521A", cursor: "help", color: "#F4A261", fontWeight: 600 }}>
          {p.content}
        </span>
        {hoveredWord === p.content && (
          <span style={{
            position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
            transform: "translateX(-50%)",
            background: "#1A1A22", color: "#F0EDE8",
            padding: "8px 12px", borderRadius: 8, fontSize: 12,
            width: 190, textAlign: "center", lineHeight: 1.4,
            border: "1px solid #2A2A35", boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            zIndex: 200, pointerEvents: "none", whiteSpace: "normal",
          }}>{p.def}</span>
        )}
      </span>
    ) : <span key={i}>{p.content}</span>
  );
}

function smallBtn(dm) {
  return {
    padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer",
    background: dm ? "#F0E6D3" : "#2A2A35",
    color: dm ? "#1a1a2e" : "#F0EDE8", fontWeight: 700, fontSize: 12,
  };
}

function navBtn(dm, disabled, primary, color) {
  return {
    padding: "11px 22px", borderRadius: 10, border: "none",
    cursor: disabled ? "default" : "pointer",
    background: disabled ? (dm ? "#E8E0D5" : "#1A1A22") : (primary ? color : (dm ? "#F0E6D3" : "#2A2A35")),
    color: disabled ? (dm ? "#A09080" : "#4A4A55") : (primary ? "#fff" : (dm ? "#1a1a2e" : "#F0EDE8")),
    fontWeight: 700, fontSize: 13, opacity: disabled ? 0.5 : 1, transition: "all 0.2s",
  };
}
