import { describe, it, expect } from "vitest";
import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it("akzeptiert interne Pfade", () => {
    expect(safeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(safeRedirectPath("/antrag/neu")).toBe("/antrag/neu");
  });

  it("nutzt Fallback bei leerem/fehlendem Wert", () => {
    expect(safeRedirectPath(null)).toBe("/dashboard");
    expect(safeRedirectPath(undefined)).toBe("/dashboard");
    expect(safeRedirectPath("")).toBe("/dashboard");
  });

  it("blockt absolute/externe URLs", () => {
    expect(safeRedirectPath("https://evil.test")).toBe("/dashboard");
    expect(safeRedirectPath("http://evil.test")).toBe("/dashboard");
  });

  it("blockt protokoll-relative und Backslash-Tricks", () => {
    expect(safeRedirectPath("//evil.test")).toBe("/dashboard");
    expect(safeRedirectPath("/\\evil.test")).toBe("/dashboard");
  });

  it("erlaubt eigenen Fallback", () => {
    expect(safeRedirectPath(null, "/login")).toBe("/login");
  });
});
