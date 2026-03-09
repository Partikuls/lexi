import { z } from "zod";
import { CourseJSON } from "@/types/course";

const ImagePositionSchema = z.union([
  z.literal("before_content"),
  z.literal("after_content"),
  z.literal("in_quiz"),
  z.string().regex(/^after_paragraph_\d+$/),
]);

const CourseImageSchema = z.object({
  id: z.string().min(1),
  url: z.string(),
  type: z.enum(["ILLUSTRATIVE", "SCHEMA", "EXERCICE"]),
  position: ImagePositionSchema,
  altText: z.string().min(1),
  dyslexiaCaption: z.string().min(1),
  keyElements: z.array(z.string()),
  linkedQuestion: z.number().optional(),
});

const QuizQuestionSchema = z.object({
  q: z.string().min(1),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  answer: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  explanation: z.string().min(1),
  requiresImage: z.boolean().optional(),
  imageRef: z.string().optional(),
});

const CourseSectionSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  emoji: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  content: z.string().min(1),
  dyslexiaContent: z.array(z.string().min(1)).min(1),
  keyWords: z.array(
    z.object({
      word: z.string().min(1),
      def: z.string().min(1),
    })
  ),
  images: z.array(CourseImageSchema).default([]),
  quiz: z.array(QuizQuestionSchema).min(1),
});

const CourseJSONSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  level: z.string().min(1),
  duration: z.string().min(1),
  objectives: z.array(z.string().min(1)).min(1),
  sections: z.array(CourseSectionSchema).min(1),
});

export interface ValidationResult {
  success: boolean;
  data?: CourseJSON;
  error?: string;
}

export function validateCourseJSON(data: unknown): ValidationResult {
  const result = CourseJSONSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data as CourseJSON };
  }

  const errors = result.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  return { success: false, error: errors };
}

export { CourseJSONSchema, CourseSectionSchema, CourseImageSchema, QuizQuestionSchema };
