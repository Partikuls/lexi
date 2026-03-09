# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lexi is an AI-powered EdTech platform that transforms raw school course documents (Word/PDF) into interactive web experiences with a dedicated dyslexia-adapted mode. Teachers upload a file, and within 90 seconds get a shareable link to an interactive course.

## Tech Stack

- **Framework**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **AI**: Anthropic API — claude-sonnet-4 (text + vision multimodal)
- **Document Parsing**: LlamaParse (text + images extraction), Mammoth (docx fallback)
- **Database & Storage**: Supabase (PostgreSQL + Storage bucket `course-images`)
- **Auth**: Supabase Auth (magic link for teachers, public link for students)
- **Validation**: Zod
- **Image Processing**: Sharp (WebP conversion)
- **Tests**: Vitest (unit), Playwright (E2E)

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
```

## Architecture

### 2-Pass AI Pipeline

All AI calls go through server-side API routes (never expose ANTHROPIC_API_KEY client-side).

1. **Pass 1 — Vision** (`lib/agent/analyzeImage.ts`): Claude Vision analyzes each extracted image individually. Classifies as ILLUSTRATIVE, SCHEMA, or EXERCICE. Generates alt-text, dyslexia caption, key elements. Batch of 3 max, parallel with `Promise.all`.

2. **Pass 2 — Structuration** (`lib/agent/transform.ts`): Claude receives parsed text + image metadata, outputs a strict JSON structure with sections, dyslexia content, keywords, quiz, and image placements. Streamed via SSE.

Both passes output **strict JSON only** (no markdown, no backticks). Invalid JSON triggers automatic retry (max 2).

### Output JSON Structure

The core data model is `CourseJSON` (defined in `types/course.ts`):
- `sections[]`: each has `content` (standard), `dyslexiaContent` (line-by-line simplified), `keyWords`, `images[]`, `quiz[]`
- Images have a `type` (ILLUSTRATIVE/SCHEMA/EXERCICE) and a `position` (before_content, after_content, after_paragraph_N, in_quiz)
- Quiz questions can reference images via `requiresImage` + `imageRef`

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/upload` | POST | Receive file, parse with LlamaParse, store images |
| `/api/analyze-images` | POST | Claude Vision analysis per image (Pass 1) |
| `/api/transform` | POST | Pedagogical structuration with streaming SSE (Pass 2) |
| `/api/course/[token]` | GET | Return complete structured course |
| `/api/session` | POST | Record reading session |

### Key Pages

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/upload` | File upload (drag & drop + paste text) |
| `/processing/[id]` | Animated processing steps with image counter |
| `/course/[token]` | Interactive course viewer (standard + dyslexia toggle) |
| `/dashboard` | Teacher dashboard with course list and image stats |

## Dyslexia Mode Design System

These values are non-negotiable for accessibility compliance (WCAG AAA):

| Property | Value |
|---|---|
| Font | Trebuchet MS, sans-serif |
| Base size | 1.12rem (min 17px) |
| Line height | 2.2 |
| Letter spacing | 0.07em |
| Word spacing | 0.2em |
| Background | #FFF8F0 |
| Odd lines | #FFFDF5 bg + #FFD166 left border |
| Even lines | #F5F8FF bg + #93C5FD left border |
| Image border | 3px solid #FFD166 |
| Text contrast | 7:1 minimum ratio |

Dyslexia content rules: max 10 words per line, one idea per line, use arrows and checkmarks for structure. Mode persisted in localStorage, applied before first render to avoid flash.

## Image Handling Rules

- SCHEMA and EXERCICE images must never be omitted — always displayed AND described
- In dyslexia mode: EXERCICE images get a full text description BEFORE the quiz question
- Missing/unextractable images: graceful fallback with alt-text placeholder, never crash
- Low-res images (< 100px): default to ILLUSTRATIVE
- All `<img>` must have non-empty `alt` attribute

## Reference Prototypes

`bief/lexi-prototype.jsx` — Static course viewer with Révolution française demo data
`bief/lexi-agent.jsx` — Full input-to-result pipeline prototype with Claude API call

These contain the reference UI patterns (dark theme, color palette, component structure) to follow when building production components.

## Environment Variables

Required in `.env.local`:
```
ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
SUPABASE_SERVICE_ROLE_KEY, LLAMAPARSE_API_KEY, NEXT_PUBLIC_APP_URL,
MAX_FILE_SIZE_MB (20), MAX_IMAGES_PER_COURSE (20), IMAGE_ANALYSIS_BATCH_SIZE (3)
```

## Language

The application UI and all generated content are in **French**. Code (variables, comments, types) is in **English**.
