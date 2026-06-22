import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// PROJ-6 — Integrationstests der Einreichungs-API. Auth, Datenzugriff, PDF und
// E-Mail sind gemockt, damit die Routenlogik (Auth, Validierung, Reihenfolge,
// Best-effort von PDF/E-Mail/Entwurf-Leeren) isoliert prüfbar ist.

const getUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
}));

vi.mock("@/lib/submissions/store", () => ({
  insertSubmissionRow: vi.fn(),
}));
vi.mock("@/lib/drafts/store", () => ({
  deleteDraftRow: vi.fn(),
}));
vi.mock("@/lib/pdf/server", () => ({
  renderFlexcoverPdfBuffer: vi.fn(async () => Buffer.from("%PDF-fake")),
}));
vi.mock("@/lib/email/resend", () => ({
  sendSubmissionEmail: vi.fn(async () => true),
}));

import { POST } from "./route";
import * as store from "@/lib/submissions/store";
import * as drafts from "@/lib/drafts/store";
import * as pdf from "@/lib/pdf/server";
import * as email from "@/lib/email/resend";
import type { SubmissionRow } from "@/lib/submissions/types";

const USER = { id: "user-1", email: "antrag@firma.de" };

function params(formId = "flexcover") {
  return { params: Promise.resolve({ formId }) };
}
function postReq(body: unknown): NextRequest {
  return new Request("http://localhost/api/submissions/flexcover", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  }) as unknown as NextRequest;
}

function submission(overrides: Partial<SubmissionRow> = {}): SubmissionRow {
  return {
    id: "123e4567-e89b-42d3-a456-426614174000",
    user_id: USER.id,
    form_id: "flexcover",
    reference: "FC-2026-A1B2C3",
    data: { Ansprechpartner: { email: "a@b.de" } },
    submitted_at: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockResolvedValue({ data: { user: USER } });
  vi.mocked(store.insertSubmissionRow).mockResolvedValue(submission());
  vi.mocked(drafts.deleteDraftRow).mockResolvedValue(undefined);
  vi.mocked(pdf.renderFlexcoverPdfBuffer).mockResolvedValue(Buffer.from("%PDF-fake"));
  vi.mocked(email.sendSubmissionEmail).mockResolvedValue(true);
});

describe("POST /api/submissions/[formId]", () => {
  it("401 ohne Anmeldung", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(postReq({ data: {} }), params());
    expect(res.status).toBe(401);
    expect(store.insertSubmissionRow).not.toHaveBeenCalled();
  });

  it("400 bei ungültiger Formular-ID", async () => {
    const res = await POST(postReq({ data: {} }), params("Bad ID!"));
    expect(res.status).toBe(400);
  });

  it("400 bei ungültigem Body (data fehlt)", async () => {
    const res = await POST(postReq({ foo: "bar" }), params());
    expect(res.status).toBe(400);
    expect(store.insertSubmissionRow).not.toHaveBeenCalled();
  });

  it("413 bei zu großem Antrag", async () => {
    const big = { feld: "x".repeat(1_000_001) };
    const res = await POST(postReq({ data: big }), params());
    expect(res.status).toBe(413);
    expect(store.insertSubmissionRow).not.toHaveBeenCalled();
  });

  it("Happy Path: protokolliert, versendet E-Mail, leert Entwurf", async () => {
    const res = await POST(postReq({ data: { a: 1 } }), params());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.reference).toBe("FC-2026-A1B2C3");
    expect(json.emailSent).toBe(true);
    expect(store.insertSubmissionRow).toHaveBeenCalledOnce();
    expect(email.sendSubmissionEmail).toHaveBeenCalledOnce();
    expect(drafts.deleteDraftRow).toHaveBeenCalledWith(expect.anything(), "flexcover");
  });

  it("500, wenn die Protokollierung scheitert — keine E-Mail, kein Entwurf-Leeren", async () => {
    vi.mocked(store.insertSubmissionRow).mockRejectedValue(new Error("db down"));
    const res = await POST(postReq({ data: { a: 1 } }), params());
    expect(res.status).toBe(500);
    expect(email.sendSubmissionEmail).not.toHaveBeenCalled();
    expect(drafts.deleteDraftRow).not.toHaveBeenCalled();
  });

  it("Einreichung bleibt erfolgreich, wenn die E-Mail scheitert (best-effort)", async () => {
    vi.mocked(email.sendSubmissionEmail).mockResolvedValue(false);
    const res = await POST(postReq({ data: { a: 1 } }), params());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.emailSent).toBe(false);
    expect(json.reference).toBe("FC-2026-A1B2C3");
    expect(drafts.deleteDraftRow).toHaveBeenCalledOnce();
  });

  it("Einreichung bleibt erfolgreich, wenn die PDF-Erzeugung wirft (best-effort)", async () => {
    vi.mocked(pdf.renderFlexcoverPdfBuffer).mockRejectedValue(new Error("render fail"));
    const res = await POST(postReq({ data: { a: 1 } }), params());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.emailSent).toBe(false);
    expect(drafts.deleteDraftRow).toHaveBeenCalledOnce();
  });

  it("Einreichung bleibt erfolgreich, wenn das Entwurf-Leeren scheitert (best-effort)", async () => {
    vi.mocked(drafts.deleteDraftRow).mockRejectedValue(new Error("delete fail"));
    const res = await POST(postReq({ data: { a: 1 } }), params());
    expect(res.status).toBe(200);
    expect((await res.json()).reference).toBe("FC-2026-A1B2C3");
  });
});
