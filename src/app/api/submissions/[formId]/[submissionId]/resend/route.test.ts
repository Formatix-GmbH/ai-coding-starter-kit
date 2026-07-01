import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// PROJ-6 — Integrationstests für „E-Mail erneut senden". Auth, Datenzugriff, PDF
// und E-Mail sind gemockt (Routenlogik isoliert: Auth, ID-Validierung, owner-only
// via 404, Ablauf-Guard, Best-effort-Versand).

const getUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
}));
vi.mock("@/lib/submissions/store", () => ({
  getSubmissionRow: vi.fn(),
}));
vi.mock("@/lib/pdf/server", () => ({
  renderFlexcoverPdfBuffer: vi.fn(async () => Buffer.from("%PDF-fake")),
}));
vi.mock("@/lib/pdf/musterantrag/server", () => ({
  renderMusterantragPdfBuffer: vi.fn(async () => Buffer.from("%PDF-muster")),
}));
vi.mock("@/lib/email/resend", () => ({
  sendSubmissionEmail: vi.fn(async () => true),
}));

import { POST } from "./route";
import * as store from "@/lib/submissions/store";
import * as email from "@/lib/email/resend";
import type { SubmissionRow } from "@/lib/submissions/types";

const USER = { id: "user-1", email: "antrag@firma.de" };
const VALID_ID = "123e4567-e89b-42d3-a456-426614174000";

function params(submissionId = VALID_ID, formId = "flexcover") {
  return { params: Promise.resolve({ formId, submissionId }) };
}
const req = {} as NextRequest;

function submission(overrides: Partial<SubmissionRow> = {}): SubmissionRow {
  return {
    id: VALID_ID,
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
  vi.mocked(store.getSubmissionRow).mockResolvedValue(submission());
  vi.mocked(email.sendSubmissionEmail).mockResolvedValue(true);
});

describe("POST /api/submissions/[formId]/[submissionId]/resend", () => {
  it("401 ohne Anmeldung", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(req, params());
    expect(res.status).toBe(401);
  });

  it("400 bei ungültiger Einreichungs-ID (keine UUID)", async () => {
    const res = await POST(req, params("nicht-uuid"));
    expect(res.status).toBe(400);
    expect(store.getSubmissionRow).not.toHaveBeenCalled();
  });

  it("404, wenn keine (eigene) Einreichung existiert", async () => {
    vi.mocked(store.getSubmissionRow).mockResolvedValue(null);
    const res = await POST(req, params());
    expect(res.status).toBe(404);
    expect(email.sendSubmissionEmail).not.toHaveBeenCalled();
  });

  it("404 bei abgelaufener Einreichung (Lazy-Guard)", async () => {
    vi.mocked(store.getSubmissionRow).mockResolvedValue(
      submission({ submitted_at: new Date(Date.now() - 31 * 86400000).toISOString() }),
    );
    const res = await POST(req, params());
    expect(res.status).toBe(404);
  });

  it("Happy Path: versendet erneut und meldet emailSent=true", async () => {
    const res = await POST(req, params());
    expect(res.status).toBe(200);
    expect((await res.json()).emailSent).toBe(true);
    expect(email.sendSubmissionEmail).toHaveBeenCalledOnce();
  });

  it("emailSent=false, wenn der Versand scheitert (best-effort, kein Fehler)", async () => {
    vi.mocked(email.sendSubmissionEmail).mockResolvedValue(false);
    const res = await POST(req, params());
    expect(res.status).toBe(200);
    expect((await res.json()).emailSent).toBe(false);
  });
});
