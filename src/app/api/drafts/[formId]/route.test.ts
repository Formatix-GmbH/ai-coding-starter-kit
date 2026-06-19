import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// PROJ-4 — Integrationstests der Entwurf-API. Auth + Datenzugriff sind gemockt,
// damit Routenlogik (Auth, Validierung, Konflikt, Ablauf, Größe) isoliert prüfbar ist.

const getUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
}));

vi.mock("@/lib/drafts/store", () => ({
  getDraftRow: vi.fn(),
  insertDraftRow: vi.fn(),
  updateDraftRow: vi.fn(),
  deleteDraftRow: vi.fn(),
}));

import { GET, PUT, DELETE } from "./route";
import * as store from "@/lib/drafts/store";
import type { DraftRow } from "@/lib/drafts/types";

const USER = { id: "user-1" };

function params(formId = "flexcover") {
  return { params: Promise.resolve({ formId }) };
}
function putReq(body: unknown): NextRequest {
  return new Request("http://localhost/api/drafts/flexcover", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  }) as unknown as NextRequest;
}
const emptyReq = {} as NextRequest;

function row(overrides: Partial<DraftRow> = {}): DraftRow {
  return {
    id: "d1",
    user_id: USER.id,
    form_id: "flexcover",
    data: { Ansprechpartner: { email: "a@b.de" } },
    active_section: "Ansprechpartner",
    created_at: "2026-06-19T10:00:00.000Z",
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockResolvedValue({ data: { user: USER } });
});

describe("GET /api/drafts/[formId]", () => {
  it("401 ohne Anmeldung", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await GET(emptyReq, params());
    expect(res.status).toBe(401);
  });

  it("400 bei ungültiger Formular-ID", async () => {
    const res = await GET(emptyReq, params("Bad ID!"));
    expect(res.status).toBe(400);
  });

  it("liefert null, wenn kein Entwurf existiert", async () => {
    vi.mocked(store.getDraftRow).mockResolvedValue(null);
    const res = await GET(emptyReq, params());
    expect(res.status).toBe(200);
    expect((await res.json()).draft).toBeNull();
  });

  it("liefert den Entwurf, wenn frisch", async () => {
    const draft = row();
    vi.mocked(store.getDraftRow).mockResolvedValue(draft);
    const res = await GET(emptyReq, params());
    expect((await res.json()).draft.id).toBe("d1");
  });

  it("löscht abgelaufene Entwürfe und liefert null (Lazy-Guard)", async () => {
    const old = row({ updated_at: new Date(Date.now() - 15 * 86400000).toISOString() });
    vi.mocked(store.getDraftRow).mockResolvedValue(old);
    const res = await GET(emptyReq, params());
    expect(await res.json()).toEqual({ draft: null });
    expect(store.deleteDraftRow).toHaveBeenCalledOnce();
  });
});

describe("PUT /api/drafts/[formId]", () => {
  it("401 ohne Anmeldung", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await PUT(putReq({ data: {} }), params());
    expect(res.status).toBe(401);
  });

  it("400 bei ungültigem Body (data fehlt)", async () => {
    const res = await PUT(putReq({ activeSection: "x" }), params());
    expect(res.status).toBe(400);
  });

  it("413 bei zu großem Entwurf", async () => {
    const big = { feld: "x".repeat(1_000_001) };
    const res = await PUT(putReq({ data: big }), params());
    expect(res.status).toBe(413);
  });

  it("legt einen neuen Entwurf an, wenn keiner existiert", async () => {
    vi.mocked(store.getDraftRow).mockResolvedValue(null);
    vi.mocked(store.insertDraftRow).mockResolvedValue(row());
    const res = await PUT(putReq({ data: { a: 1 }, activeSection: "Ansprechpartner" }), params());
    expect(res.status).toBe(200);
    expect(store.insertDraftRow).toHaveBeenCalledOnce();
    expect(store.updateDraftRow).not.toHaveBeenCalled();
  });

  it("aktualisiert bei passender Versionsmarke", async () => {
    const existing = row({ updated_at: "2026-06-19T11:00:00.000Z" });
    vi.mocked(store.getDraftRow).mockResolvedValue(existing);
    vi.mocked(store.updateDraftRow).mockResolvedValue(row());
    const res = await PUT(
      putReq({ data: { a: 2 }, expectedUpdatedAt: "2026-06-19T11:00:00.000Z" }),
      params(),
    );
    expect(res.status).toBe(200);
    expect(store.updateDraftRow).toHaveBeenCalledOnce();
  });

  it("409 bei Konflikt (veraltete Versionsmarke)", async () => {
    const existing = row({ updated_at: "2026-06-19T12:00:00.000Z" });
    vi.mocked(store.getDraftRow).mockResolvedValue(existing);
    const res = await PUT(
      putReq({ data: { a: 2 }, expectedUpdatedAt: "2026-06-19T11:00:00.000Z" }),
      params(),
    );
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.conflict).toBe(true);
    expect(json.draft.id).toBe("d1");
    expect(store.updateDraftRow).not.toHaveBeenCalled();
  });

  it("überschreibt bei force trotz Konflikt", async () => {
    const existing = row({ updated_at: "2026-06-19T12:00:00.000Z" });
    vi.mocked(store.getDraftRow).mockResolvedValue(existing);
    vi.mocked(store.updateDraftRow).mockResolvedValue(row());
    const res = await PUT(
      putReq({ data: { a: 2 }, expectedUpdatedAt: "2026-06-19T11:00:00.000Z", force: true }),
      params(),
    );
    expect(res.status).toBe(200);
    expect(store.updateDraftRow).toHaveBeenCalledOnce();
  });
});

describe("DELETE /api/drafts/[formId]", () => {
  it("401 ohne Anmeldung", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await DELETE(emptyReq, params());
    expect(res.status).toBe(401);
  });

  it("löscht den Entwurf", async () => {
    vi.mocked(store.deleteDraftRow).mockResolvedValue(undefined);
    const res = await DELETE(emptyReq, params());
    expect(res.status).toBe(200);
    expect(store.deleteDraftRow).toHaveBeenCalledWith(expect.anything(), "flexcover");
  });
});
