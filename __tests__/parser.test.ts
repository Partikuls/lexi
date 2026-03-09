import { describe, it, expect } from "vitest";
import { isSupportedFile } from "@/lib/parser/index";

describe("isSupportedFile", () => {
  it("accepts PDF files", () => {
    expect(isSupportedFile("application/pdf")).toBe(true);
  });

  it("accepts DOCX files", () => {
    expect(
      isSupportedFile(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ).toBe(true);
  });

  it("accepts legacy DOC files", () => {
    expect(isSupportedFile("application/msword")).toBe(true);
  });

  it("rejects plain text", () => {
    expect(isSupportedFile("text/plain")).toBe(false);
  });

  it("rejects images", () => {
    expect(isSupportedFile("image/png")).toBe(false);
    expect(isSupportedFile("image/jpeg")).toBe(false);
  });

  it("rejects HTML", () => {
    expect(isSupportedFile("text/html")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isSupportedFile("")).toBe(false);
  });

  it("rejects spreadsheet formats", () => {
    expect(
      isSupportedFile(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
    ).toBe(false);
  });
});
