# Lexi — Plan de développement

## Phase 1 — Foundation (Semaine 1-2)

> Objectif : pipeline bout en bout fonctionnel, images incluses.

### 1.1 Setup projet ✅

- [x] Init Next.js 14 avec TypeScript, Tailwind CSS, App Router
- [x] Installer les dépendances : `@anthropic-ai/sdk`, `@supabase/supabase-js`, `zod`, `mammoth`, `sharp`
- [x] Configurer `.env.local` (ANTHROPIC_API_KEY, Supabase URL/keys, LlamaParse key, etc.)
- [x] Créer la structure de dossiers (`app/`, `components/`, `hooks/`, `lib/`, `types/`)
- [x] Configurer Supabase : SQL migration `lib/supabase/schema.sql` (tables + bucket + RLS)
- [x] Configurer Vitest + Playwright
- [x] Landing page placeholder + layout FR + CSS variables

### 1.2 Types TypeScript ✅

- [x] Créer `types/course.ts` avec tous les types centralisés : `ImageType`, `ImagePosition`, `CourseImage`, `QuizQuestion`, `CourseSection`, `CourseJSON`, `CourseRow`, `CourseImageRow`

### 1.3 Parsing documents ✅

- [x] Créer `lib/parser/types.ts` : `ExtractedImage`, `ParseResult`
- [x] Implémenter `lib/parser/llamaparse.ts` : extraction texte + images base64 via REST API (upload → poll → result)
- [x] Implémenter `lib/parser/docx.ts` : fallback avec mammoth pour les .docx
- [x] Implémenter `lib/parser/index.ts` : router (PDF→LlamaParse, DOCX→LlamaParse+Mammoth fallback)
- [x] Gérer le cas `[IMAGE_NOT_EXTRACTED]` (images non extractibles)

### 1.4 Stockage images ✅

- [x] Implémenter `lib/storage/images.ts` : upload images base64 vers Supabase Storage, retour d'URLs publiques
- [x] Valider les types MIME avant stockage (png, jpeg, gif, webp uniquement)
- [x] Limiter la taille des fichiers (MAX_FILE_SIZE_MB = 20)
- [x] Conversion automatique en WebP via sharp (sauf GIF)

### 1.5 Agent IA — Pass 1 (Vision) ✅

- [x] Implémenter `lib/agent/analyzeImage.ts` : appel Claude Vision par image
- [x] System prompt de classification : type (ILLUSTRATIVE/SCHEMA/EXERCICE), alt-text, dyslexiaCaption, keyElements, linkedQuestion
- [x] Traitement en batch de 3 images max (configurable via IMAGE_ANALYSIS_BATCH_SIZE)
- [x] Traitement parallèle (`Promise.all`) par batch
- [x] Prioriser les grandes images (tri par taille décroissante)
- [x] Gérer les images basse résolution (< 100px → ILLUSTRATIVE par défaut)

### 1.6 Agent IA — Pass 2 (Structuration) ✅

- [x] Implémenter `lib/agent/systemPrompt.ts` : system prompt de structuration pédagogique avec contexte images
- [x] Implémenter `lib/agent/transform.ts` : appel Claude avec texte + métadonnées images → JSON structuré
- [x] Intégration des images aux bonnes positions dans les sections (mergeImageData)
- [x] SSE streaming via `transformCourseStream()`
- [x] Retry automatique si JSON invalide (max 2 retries avec correction hint)

### 1.7 Validation ✅

- [x] Implémenter `lib/agent/validate.ts` : schémas Zod pour `CourseJSON`, `CourseSection`, `CourseImage`, `QuizQuestion`
- [x] Retry automatique si JSON invalide (max 2 retries — implémenté dans transform.ts)

### 1.8 Supabase client ✅

- [x] Implémenter `lib/supabase/client.ts` (client browser avec @supabase/ssr)
- [x] Implémenter `lib/supabase/server.ts` (client serveur avec service role)

### 1.9 API Routes ✅

- [x] `app/api/upload/route.ts` : POST — reçoit fichier, parse, stocke images, crée course draft
- [x] `app/api/analyze-images/route.ts` : POST — analyse chaque image avec Claude Vision (Pass 1)
- [x] `app/api/transform/route.ts` : POST — structuration pédagogique avec SSE streaming
- [x] `app/api/course/[token]/route.ts` : GET — retourne le cours structuré complet
- [x] `app/api/session/route.ts` : POST — enregistre session de lecture (logging pour l'instant)

### 1.10 Pages minimales ✅

- [x] `app/page.tsx` : Landing page — pitch + CTA upload
- [x] `app/upload/page.tsx` : Interface upload (drag & drop + coller texte)
- [x] `app/processing/[id]/page.tsx` : étapes animées avec compteur "Analyse image X/N"
- [x] `app/course/[token]/page.tsx` : viewer complet (sidebar, contenu, mode dyslexie, quiz)

---

## Phase 2 — UI/UX (Semaine 3)

> Objectif : expérience utilisateur soignée, mode dyslexie avec images parfait.

### 2.1 Composants cours ✅

- [x] `components/course/CourseViewer.tsx` : orchestrateur (dyslexia hook, font size, quiz state)
- [x] `components/course/SectionContent.tsx` : contenu standard avec keyword highlighting + tooltips
- [x] `components/course/DyslexiaContent.tsx` : lignes alternées colorées (CSS classes .dys-line)
- [x] `components/course/KeyWords.tsx` : affichage mots-clés en pills
- [x] `components/course/Sidebar.tsx` : navigation + progression + objectifs
- [x] `components/course/Quiz.tsx` : quiz interactif avec feedback correct/incorrect
- [x] `app/course/[token]/page.tsx` : refactoré pour utiliser `<CourseViewer>`

### 2.2 Composants images ✅

- [x] `components/course/ImageBlock.tsx` : affichage images selon type et mode (standard/dyslexie)
  - [x] ILLUSTRATIVE : image + alt-text en title (standard) / image + légende courte visible (dyslexie)
  - [x] SCHEMA : image + éléments clés en tooltip (standard) / image + légende + keyElements en bullets (dyslexie)
  - [x] EXERCICE : image dans le quiz (standard) / image + description alt complète AVANT la question (dyslexie)
- [x] `components/course/ImageFallback.tsx` : placeholder si image manquante avec alt-text
- [x] Contour visible autour des images en mode dyslexie (border 3px #FFD166)
- [x] Lazy loading systématique des images
- [x] Images `after_paragraph_N` insérées inline dans SectionContent et DyslexiaContent
- [x] Images EXERCICE liées aux questions quiz via `imageRef`

### 2.3 Mode dyslexie complet ✅

- [x] Variables CSS dyslexie : font Trebuchet MS, size 1.12rem, line-height 2.2, letter-spacing 0.07em, word-spacing 0.2em
- [x] Background #FFF8F0, lignes alternées (impaires #FFFDF5 + border #FFD166, paires #F5F8FF + border #93C5FD)
- [x] Contraste texte minimum 7:1 (WCAG AAA)
- [x] `hooks/useDyslexiaMode.ts` : toggle + persistance localStorage + sync DOM class
- [x] Appliquer le mode avant premier rendu (Script beforeInteractive dans layout.tsx)
- [x] `hooks/useFontSize.ts` : contrôle taille police (A-/A+, range 0.8–1.4, localStorage)

### 2.4 Composants upload ✅

- [x] `components/upload/DropZone.tsx` : drag & drop + sélection fichier
- [x] `components/upload/ProcessingSteps.tsx` : étapes animées avec compteur images "Analyse image 2/5..."
- [x] `app/upload/page.tsx` refactoré pour utiliser `<DropZone>`
- [x] `app/processing/[id]/page.tsx` refactoré pour utiliser `<ProcessingSteps>`

### 2.5 Tooltips mots-clés ✅

- [x] Mots-clés surlignés dans le texte standard avec tooltip au hover (définition) — implémenté dans SectionContent.tsx (renderWithKeywords)

### 2.6 Responsive ✅

- [x] Mobile (< 768px) : sidebar en drawer overlay, bouton menu hamburger, padding réduit, boutons touch 44px min
- [x] Tablette (768–1024px) : sidebar collapsible via drawer, padding intermédiaire
- [x] Desktop (> 1024px) : sidebar sticky visible, layout 3-régions actuel
- [x] Header responsive : texte tronqué, sous-titre masqué sur mobile, bouton dyslexie raccourci
- [x] Upload page : logo/texte/espacement adaptés mobile
- [x] Navigation prev/next : min-height 44px touch targets

### 2.7 Dashboard enseignant ✅

- [x] `app/api/courses/route.ts` : GET — liste des cours avec stats images extraites du JSON
- [x] `app/dashboard/page.tsx` : grille responsive de cards (1 col mobile, 2 cols tablette+)
- [x] Stats par cours : nombre d'images par type (illustrative, schéma, exercice) en badges
- [x] Lien de partage copiable avec feedback "✓ Lien copié !"
- [x] État vide avec CTA vers upload

---

## Phase 3 — Analytics & Polish (Semaine 4)

> Objectif : tracking, retours enseignant, tests, optimisations.

### 3.1 Tracking / Analytics

- [ ] Tracker les sections lues par élève
- [ ] Tracker les images vues et temps passé sur images SCHEMA
- [ ] Tracker les résultats de quiz (score, temps)

### 3.2 Feedback enseignant

- [ ] Interface feedback sur la qualité de la transformation
- [ ] Feedback spécifique sur les analyses d'images (classification correcte ? alt-text utile ?)

### 3.3 Export PDF

- [ ] Export PDF version dyslexie avec images et légendes intégrées

### 3.4 Tests

- [ ] Tests unitaires Vitest : validation Zod, parsing, agent
- [ ] Tests E2E Playwright : pipeline complet upload → cours avec images

### 3.5 Optimisations

- [ ] Cache analyses images (même image dans plusieurs cours → même analyse)
- [ ] Conversion WebP des images uploadées (via sharp)
- [ ] Lazy loading images systématique
- [ ] Streamer la réponse de `/api/transform` vers le client (SSE)

---

## Phase 4 — V1.1 Features (Semaine 5-6)

> Objectif : fonctionnalités avancées post-MVP.

### 4.1 TTS (Text-to-Speech)

- [ ] Intégration ElevenLabs API — voix française
- [ ] Lecture audio du alt-text des images ("Je vais décrire l'image...")
- [ ] Descriptions images incluses dans le flux audio

### 4.2 Editeur enseignant

- [ ] L'enseignant peut corriger l'alt-text généré par l'IA
- [ ] L'enseignant peut corriger la légende dyslexie
- [ ] Sauvegarde des corrections en BDD

### 4.3 Zoom image

- [ ] Clic sur image → affichage plein écran
- [ ] Description complète affichée en overlay

### 4.4 Mode présentation

- [ ] Mode vidéoprojecteur : images plein écran avec légende pour projection en classe
