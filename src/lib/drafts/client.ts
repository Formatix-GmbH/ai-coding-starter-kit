// PROJ-4: Client-seitige Helfer für Entwürfe — localStorage (anonym + Fallback)
// und Aufrufe der Entwurf-API (eingeloggt).

import type { FormValues } from "@/lib/form-engine/types";
import type { DraftRow } from "./types";
import { isDraftExpired } from "./expiry";

/** Lokal gespeicherter Entwurf (anonym oder Sicherheitsnetz). */
export interface LocalDraft {
  data: FormValues;
  activeSection: string | null;
  updatedAt: string;
}

const KEY_PREFIX = "flexcover-draft:";

/** localStorage-Schlüssel. Eingeloggte (Sicherheitsnetz-)Stände werden um die
 *  User-ID erweitert, damit eine spätere anonyme Sitzung auf demselben Browser
 *  niemals den Stand eines anderen Nutzers lesen kann (DSGVO). Anonyme Entwürfe
 *  nutzen den nutzerlosen Schlüssel. */
function localKey(formId: string, userId?: string | null): string {
  return userId ? `${KEY_PREFIX}${formId}:u:${userId}` : `${KEY_PREFIX}${formId}`;
}

/** Liest den lokalen Entwurf; abgelaufene werden verworfen. SSR-sicher. */
export function readLocalDraft(formId: string, userId?: string | null): LocalDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const key = localKey(formId, userId);
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalDraft;
    if (!parsed?.updatedAt || isDraftExpired(parsed.updatedAt)) {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Schreibt den lokalen Entwurf. Gibt false zurück, wenn localStorage nicht nutzbar ist. */
export function writeLocalDraft(
  formId: string,
  data: FormValues,
  activeSection: string | null,
  userId?: string | null,
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const payload: LocalDraft = { data, activeSection, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(localKey(formId, userId), JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function clearLocalDraft(formId: string, userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(localKey(formId, userId));
  } catch {
    // ignore
  }
}

/** Entfernt sämtliche lokal gespeicherten Entwürfe (anonym + nutzerspezifisch).
 *  Wird beim Abmelden aufgerufen, damit auf gemeinsam genutzten Geräten keine
 *  Entwurfsdaten zurückbleiben. */
export function clearAllLocalDrafts(): void {
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(KEY_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

/* ------------------------------------------------------------------ */
/* Server-API                                                          */
/* ------------------------------------------------------------------ */

export type SaveResult =
  | { status: "saved"; draft: DraftRow }
  | { status: "conflict"; draft: DraftRow }
  | { status: "unauthorized" }
  | { status: "error" };

export async function fetchServerDraft(formId: string): Promise<DraftRow | null> {
  const res = await fetch(`/api/drafts/${formId}`, { cache: "no-store" });
  if (!res.ok) return null;
  const json = (await res.json()) as { draft: DraftRow | null };
  return json.draft;
}

export async function saveServerDraft(
  formId: string,
  body: {
    data: FormValues;
    activeSection: string | null;
    expectedUpdatedAt: string | null;
    force?: boolean;
  },
): Promise<SaveResult> {
  try {
    const res = await fetch(`/api/drafts/${formId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 401) return { status: "unauthorized" };
    if (res.status === 409) {
      const json = (await res.json()) as { draft: DraftRow };
      return { status: "conflict", draft: json.draft };
    }
    if (!res.ok) return { status: "error" };
    const json = (await res.json()) as { draft: DraftRow };
    return { status: "saved", draft: json.draft };
  } catch {
    return { status: "error" };
  }
}

export async function deleteServerDraft(formId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/drafts/${formId}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}
