"use client";

// PROJ-4: Auto-Save-Hook für Formular-Entwürfe.
// - anonym  ("local"): speichert in localStorage
// - eingeloggt ("server"): speichert über die Entwurf-API, mit localStorage als
//   Sicherheitsnetz (Server-/Sitzungsfehler verlieren nichts)
// Debounced (~2 s) + Flush bei Tab-Wechsel/Seite verlassen; optimistische
// Konflikterkennung über die Versionsmarke (updated_at).

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormValues } from "@/lib/form-engine/types";
import type { DraftRow } from "@/lib/drafts/types";
import {
  clearLocalDraft,
  deleteServerDraft,
  saveServerDraft,
  writeLocalDraft,
} from "@/lib/drafts/client";

export type SaveStatus =
  | "idle"
  | "saving"
  | "saved"
  | "error"
  | "stale"
  | "sessionExpired";

export interface UseDraftAutosaveOptions {
  formId: string;
  mode: "local" | "server";
  /** User-ID (eingeloggt) → nutzerspezifischer localStorage-Schlüssel für den
   *  Sicherheitsnetz-Spiegel. Anonym: weglassen/null. */
  userId?: string | null;
  /** Bekannte Versionsmarke des geladenen Server-Entwurfs (für Konflikterkennung). */
  initialUpdatedAt?: string | null;
  /** Zeitstempel des geladenen Entwurfs (für die Statusanzeige). */
  initialSavedAt?: string | null;
  debounceMs?: number;
}

interface Snapshot {
  values: FormValues;
  section: string | null;
}

export function useDraftAutosave({
  formId,
  mode,
  userId = null,
  initialUpdatedAt = null,
  initialSavedAt = null,
  debounceMs = 2000,
}: UseDraftAutosaveOptions) {
  // Anonym → nutzerloser Schlüssel; eingeloggt → nutzerspezifischer Schlüssel.
  const localUserId = mode === "server" ? userId : null;
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialSavedAt);
  const [conflictDraft, setConflictDraft] = useState<DraftRow | null>(null);
  const [localUnavailable, setLocalUnavailable] = useState(false);

  const latest = useRef<Snapshot>({ values: {}, section: null });
  const persistedSnapshot = useRef<string | null>(null);
  const knownUpdatedAt = useRef<string | null>(initialUpdatedAt);
  const initialized = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Selbstreferenz für den automatischen Wiederholversuch (vermeidet TDZ in doSave).
  const doSaveRef = useRef<(force?: boolean) => Promise<void>>(() => Promise.resolve());

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const snapshotKey = (s: Snapshot) =>
    JSON.stringify({ v: s.values, s: s.section });

  const persistLocal = useCallback(() => {
    const ok = writeLocalDraft(formId, latest.current.values, latest.current.section, localUserId);
    if (!ok) setLocalUnavailable(true);
    return ok;
  }, [formId, localUserId]);

  const doSave = useCallback(
    async (force = false) => {
      clearTimer();
      const snap = latest.current;
      const key = snapshotKey(snap);

      if (mode === "local") {
        const ok = persistLocal();
        if (ok) {
          persistedSnapshot.current = key;
          setLastSavedAt(new Date().toISOString());
          setStatus("saved");
        } else {
          setStatus("error");
        }
        return;
      }

      // mode === "server"
      setStatus("saving");
      const result = await saveServerDraft(formId, {
        data: snap.values,
        activeSection: snap.section,
        expectedUpdatedAt: knownUpdatedAt.current,
        force,
      });

      if (result.status === "saved") {
        knownUpdatedAt.current = result.draft.updated_at;
        persistedSnapshot.current = key;
        setLastSavedAt(result.draft.updated_at);
        setConflictDraft(null);
        setStatus("saved");
        persistLocal(); // Sicherheitsnetz
        return;
      }

      // Fehlerfälle: Stand lokal sichern, damit nichts verloren geht.
      persistLocal();
      if (result.status === "conflict") {
        setConflictDraft(result.draft);
        setStatus("stale");
      } else if (result.status === "unauthorized") {
        setStatus("sessionExpired");
      } else {
        setStatus("error");
        // automatischer Wiederholversuch (über Ref, um Selbstreferenz zu vermeiden)
        timer.current = setTimeout(() => void doSaveRef.current(), debounceMs);
      }
    },
    [formId, mode, debounceMs, persistLocal],
  );
  useEffect(() => {
    doSaveRef.current = doSave;
  }, [doSave]);

  /** Aus der FormEngine: aktueller Stand bei jeder Änderung. */
  const notify = useCallback(
    (values: FormValues, section: string) => {
      latest.current = { values, section };
      const key = snapshotKey(latest.current);

      // Erste Meldung = geladener Anfangszustand → als Basis merken, nicht speichern.
      if (!initialized.current) {
        initialized.current = true;
        persistedSnapshot.current = key;
        return;
      }
      if (key === persistedSnapshot.current) return; // keine echte Änderung

      clearTimer();
      timer.current = setTimeout(() => void doSave(), debounceMs);
    },
    [doSave, debounceMs],
  );

  /** Manuelles Speichern ("Jetzt speichern"). */
  const save = useCallback(() => void doSave(), [doSave]);

  /** Bei Konflikt: lokalen Stand bewusst übernehmen (überschreibt Server). */
  const forceSave = useCallback(() => void doSave(true), [doSave]);

  const clearConflict = useCallback(() => setConflictDraft(null), []);

  /** Entwurf verwerfen (Server + lokal). */
  const discard = useCallback(async () => {
    clearTimer();
    if (mode === "server") await deleteServerDraft(formId);
    clearLocalDraft(formId, localUserId);
    persistedSnapshot.current = null;
    knownUpdatedAt.current = null;
    setConflictDraft(null);
    setLastSavedAt(null);
    setStatus("idle");
  }, [formId, mode, localUserId]);

  // Flush bei Verlassen/Verstecken der Seite; lokaler Stand als Sicherheitsnetz.
  useEffect(() => {
    const hasUnsaved = () =>
      initialized.current && snapshotKey(latest.current) !== persistedSnapshot.current;

    const onVisibility = () => {
      if (document.visibilityState === "hidden" && hasUnsaved()) void doSave();
    };
    const onPageHide = () => {
      if (hasUnsaved()) persistLocal(); // synchron; Server-PUT würde beim Unload nicht zuverlässig durchlaufen
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      clearTimer();
    };
  }, [doSave, persistLocal]);

  return {
    status,
    lastSavedAt,
    conflictDraft,
    localUnavailable,
    notify,
    save,
    forceSave,
    clearConflict,
    discard,
  };
}
