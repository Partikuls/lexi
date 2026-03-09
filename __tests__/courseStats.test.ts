import { describe, it, expect } from "vitest";

// Test the image stats extraction logic used in /api/courses
function extractImageStats(data: { sections?: { images?: { type: string }[] }[] }) {
  const allImages = data.sections?.flatMap((s) => s.images || []) || [];
  return {
    illustrative: allImages.filter((img) => img.type === "ILLUSTRATIVE").length,
    schema: allImages.filter((img) => img.type === "SCHEMA").length,
    exercice: allImages.filter((img) => img.type === "EXERCICE").length,
    total: allImages.length,
  };
}

describe("extractImageStats", () => {
  it("counts images by type across sections", () => {
    const data = {
      sections: [
        {
          images: [
            { type: "ILLUSTRATIVE" },
            { type: "SCHEMA" },
          ],
        },
        {
          images: [
            { type: "EXERCICE" },
            { type: "ILLUSTRATIVE" },
            { type: "SCHEMA" },
          ],
        },
      ],
    };

    const stats = extractImageStats(data);
    expect(stats.illustrative).toBe(2);
    expect(stats.schema).toBe(2);
    expect(stats.exercice).toBe(1);
    expect(stats.total).toBe(5);
  });

  it("returns zeros for course with no images", () => {
    const data = {
      sections: [{ images: [] }, { images: [] }],
    };

    const stats = extractImageStats(data);
    expect(stats.total).toBe(0);
    expect(stats.illustrative).toBe(0);
  });

  it("handles sections without images array", () => {
    const data = {
      sections: [{}],
    };

    const stats = extractImageStats(data);
    expect(stats.total).toBe(0);
  });

  it("handles missing sections", () => {
    const stats = extractImageStats({});
    expect(stats.total).toBe(0);
  });

  it("handles empty data", () => {
    const stats = extractImageStats({ sections: [] });
    expect(stats.total).toBe(0);
  });
});
