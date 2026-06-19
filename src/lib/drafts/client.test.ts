import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  readLocalDraft,
  writeLocalDraft,
  clearLocalDraft,
  saveServerDraft,
  deleteServerDraft,
} from "./client";

const FORM = "flexcover";

describe("localStorage-Helfer", () => {
  beforeEach(() => window.localStorage.clear());

  it("write → read Roundtrip", () => {
    writeLocalDraft(FORM, { a: 1 }, "Ansprechpartner");
    const got = readLocalDraft(FORM);
    expect(got?.data).toEqual({ a: 1 });
    expect(got?.activeSection).toBe("Ansprechpartner");
    expect(got?.updatedAt).toBeTruthy();
  });

  it("kein Entwurf → null", () => {
    expect(readLocalDraft(FORM)).toBeNull();
  });

  it("abgelaufener Entwurf wird beim Lesen entfernt", () => {
    const old = {
      data: { a: 1 },
      activeSection: null,
      updatedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    };
    window.localStorage.setItem(`flexcover-draft:${FORM}`, JSON.stringify(old));
    expect(readLocalDraft(FORM)).toBeNull();
    expect(window.localStorage.getItem(`flexcover-draft:${FORM}`)).toBeNull();
  });

  it("ungültiges JSON → null", () => {
    window.localStorage.setItem(`flexcover-draft:${FORM}`, "{kaputt");
    expect(readLocalDraft(FORM)).toBeNull();
  });

  it("clear entfernt den Entwurf", () => {
    writeLocalDraft(FORM, { a: 1 }, null);
    clearLocalDraft(FORM);
    expect(readLocalDraft(FORM)).toBeNull();
  });
});

describe("Server-API-Helfer (fetch gemockt)", () => {
  afterEach(() => vi.unstubAllGlobals());

  function mockFetch(status: number, body: unknown) {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
      })),
    );
  }

  const payload = { data: { a: 1 }, activeSection: null, expectedUpdatedAt: null };

  it("200 → saved", async () => {
    mockFetch(200, { draft: { id: "d1", updated_at: "t" } });
    const res = await saveServerDraft(FORM, payload);
    expect(res.status).toBe("saved");
  });

  it("409 → conflict (mit Server-Stand)", async () => {
    mockFetch(409, { draft: { id: "d1", updated_at: "t2" } });
    const res = await saveServerDraft(FORM, payload);
    expect(res.status).toBe("conflict");
    if (res.status === "conflict") expect(res.draft.id).toBe("d1");
  });

  it("401 → unauthorized", async () => {
    mockFetch(401, { error: "x" });
    expect((await saveServerDraft(FORM, payload)).status).toBe("unauthorized");
  });

  it("500 → error", async () => {
    mockFetch(500, { error: "x" });
    expect((await saveServerDraft(FORM, payload)).status).toBe("error");
  });

  it("Netzwerkfehler → error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    expect((await saveServerDraft(FORM, payload)).status).toBe("error");
  });

  it("deleteServerDraft: ok → true", async () => {
    mockFetch(200, { ok: true });
    expect(await deleteServerDraft(FORM)).toBe(true);
  });
});
