// ── Image types ─────────────────────────────────────────────────────────────

export type ImageType = "ILLUSTRATIVE" | "SCHEMA" | "EXERCICE";

export type ImagePosition =
  | "before_content"
  | "after_content"
  | `after_paragraph_${number}`
  | "in_quiz";

export interface CourseImage {
  id: string;
  url: string;
  type: ImageType;
  position: ImagePosition;
  altText: string;
  dyslexiaCaption: string;
  keyElements: string[];
  linkedQuestion?: number;
}

// ── Quiz ────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  q: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
  requiresImage?: boolean;
  imageRef?: string;
}

// ── Section ─────────────────────────────────────────────────────────────────

export interface CourseSection {
  id: number;
  title: string;
  emoji: string;
  color: string;
  content: string;
  dyslexiaContent: string[];
  keyWords: { word: string; def: string }[];
  images: CourseImage[];
  quiz: QuizQuestion[];
}

// ── Course (top-level) ──────────────────────────────────────────────────────

export interface CourseJSON {
  title: string;
  subject: string;
  level: string;
  duration: string;
  objectives: string[];
  sections: CourseSection[];
}

// ── Database row (Supabase) ─────────────────────────────────────────────────

export interface CourseRow {
  id: string;
  token: string;
  title: string;
  subject: string;
  level: string;
  data: CourseJSON;
  created_at: string;
  user_id: string | null;
}

export interface CourseImageRow {
  id: string;
  course_id: string;
  storage_path: string;
  public_url: string;
  type: ImageType;
  alt_text: string;
  created_at: string;
}
