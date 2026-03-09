import { describe, it, expect } from "vitest";
import {
  validateCourseJSON,
  CourseJSONSchema,
  CourseSectionSchema,
  CourseImageSchema,
  QuizQuestionSchema,
} from "@/lib/agent/validate";

function makeValidSection(overrides = {}) {
  return {
    id: 1,
    title: "La Révolution française",
    emoji: "🏰",
    color: "#E8521A",
    content: "La Révolution française est un événement majeur.",
    dyslexiaContent: ["La Révolution française", "→ un événement majeur"],
    keyWords: [{ word: "Révolution", def: "Changement radical de gouvernement" }],
    images: [],
    quiz: [
      {
        q: "Quand a eu lieu la Révolution française ?",
        options: ["1789", "1689", "1889", "1589"],
        answer: 0,
        explanation: "La Révolution française a commencé en 1789.",
      },
    ],
    ...overrides,
  };
}

function makeValidCourse(overrides = {}) {
  return {
    title: "Histoire de France",
    subject: "Histoire",
    level: "4ème",
    duration: "45 min",
    objectives: ["Comprendre la Révolution française"],
    sections: [makeValidSection()],
    ...overrides,
  };
}

describe("validateCourseJSON", () => {
  it("accepts a valid course", () => {
    const result = validateCourseJSON(makeValidCourse());
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.title).toBe("Histoire de France");
  });

  it("rejects missing title", () => {
    const result = validateCourseJSON(makeValidCourse({ title: "" }));
    expect(result.success).toBe(false);
    expect(result.error).toContain("title");
  });

  it("rejects empty sections", () => {
    const result = validateCourseJSON(makeValidCourse({ sections: [] }));
    expect(result.success).toBe(false);
    expect(result.error).toContain("sections");
  });

  it("rejects missing objectives", () => {
    const result = validateCourseJSON(makeValidCourse({ objectives: [] }));
    expect(result.success).toBe(false);
  });

  it("rejects null input", () => {
    const result = validateCourseJSON(null);
    expect(result.success).toBe(false);
  });

  it("rejects non-object input", () => {
    const result = validateCourseJSON("not an object");
    expect(result.success).toBe(false);
  });
});

describe("CourseSectionSchema", () => {
  it("accepts a valid section", () => {
    const result = CourseSectionSchema.safeParse(makeValidSection());
    expect(result.success).toBe(true);
  });

  it("rejects invalid color format", () => {
    const result = CourseSectionSchema.safeParse(
      makeValidSection({ color: "red" })
    );
    expect(result.success).toBe(false);
  });

  it("accepts 6-digit hex color", () => {
    const result = CourseSectionSchema.safeParse(
      makeValidSection({ color: "#FF00AA" })
    );
    expect(result.success).toBe(true);
  });

  it("rejects empty dyslexiaContent", () => {
    const result = CourseSectionSchema.safeParse(
      makeValidSection({ dyslexiaContent: [] })
    );
    expect(result.success).toBe(false);
  });

  it("rejects section without quiz", () => {
    const result = CourseSectionSchema.safeParse(
      makeValidSection({ quiz: [] })
    );
    expect(result.success).toBe(false);
  });

  it("defaults images to empty array", () => {
    const section = makeValidSection();
    delete (section as Record<string, unknown>).images;
    const result = CourseSectionSchema.safeParse(section);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.images).toEqual([]);
    }
  });
});

describe("CourseImageSchema", () => {
  const validImage = {
    id: "img-001",
    url: "https://example.com/image.webp",
    type: "SCHEMA",
    position: "after_paragraph_2",
    altText: "Un schéma du cycle de l'eau",
    dyslexiaCaption: "Schéma montrant le cycle de l'eau",
    keyElements: ["évaporation", "condensation", "précipitation"],
  };

  it("accepts a valid image", () => {
    const result = CourseImageSchema.safeParse(validImage);
    expect(result.success).toBe(true);
  });

  it("accepts all valid positions", () => {
    for (const position of ["before_content", "after_content", "in_quiz", "after_paragraph_1", "after_paragraph_99"]) {
      const result = CourseImageSchema.safeParse({ ...validImage, position });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid position", () => {
    const result = CourseImageSchema.safeParse({
      ...validImage,
      position: "middle",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid image type", () => {
    const result = CourseImageSchema.safeParse({
      ...validImage,
      type: "PHOTO",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all three image types", () => {
    for (const type of ["ILLUSTRATIVE", "SCHEMA", "EXERCICE"]) {
      const result = CourseImageSchema.safeParse({ ...validImage, type });
      expect(result.success).toBe(true);
    }
  });

  it("accepts optional linkedQuestion", () => {
    const result = CourseImageSchema.safeParse({
      ...validImage,
      linkedQuestion: 2,
    });
    expect(result.success).toBe(true);
  });
});

describe("QuizQuestionSchema", () => {
  const validQuestion = {
    q: "Quelle est la capitale de la France ?",
    options: ["Paris", "Lyon", "Marseille", "Bordeaux"],
    answer: 0,
    explanation: "Paris est la capitale de la France.",
  };

  it("accepts a valid question", () => {
    const result = QuizQuestionSchema.safeParse(validQuestion);
    expect(result.success).toBe(true);
  });

  it("rejects answer out of range", () => {
    const result = QuizQuestionSchema.safeParse({
      ...validQuestion,
      answer: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong number of options", () => {
    const result = QuizQuestionSchema.safeParse({
      ...validQuestion,
      options: ["A", "B", "C"],
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional imageRef", () => {
    const result = QuizQuestionSchema.safeParse({
      ...validQuestion,
      requiresImage: true,
      imageRef: "img-001",
    });
    expect(result.success).toBe(true);
  });
});
