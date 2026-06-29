"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormEngine } from "@/components/form-engine/FormEngine";
import { flexcoverDefinition } from "@/lib/forms/flexcover/definition";
import type { FormValues } from "@/lib/form-engine/types";
import type { DraftRow } from "@/lib/drafts/types";
import { submitForm, SubmitError } from "@/lib/submissions/client";
import {
  readLocalDraft,
  clearLocalDraft,
  saveServerDraft,
  type LocalDraft,
} from "@/lib/drafts/client";
import { useDraftAutosave } from "@/hooks/useDraftAutosave";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";
import { turnstileEnabled } from "@/lib/turnstile/config";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FORM_ID = flexcoverDefinition.id;

interface Resolved {
  values: FormValues;
  section?: string;
  savedAt: string | null;
  updatedAt: string | null;
  loadedAt: string | null; // Zeitstempel eines wiederhergestellten Entwurfs (für Hinweis)
}

function formatRelative(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min.`;
  const h = Math.floor(min / 60);
  if (h < 24) return `vor ${h} Std.`;
  return new Date(iso).toLocaleDateString("de-DE");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/* ------------------------------------------------------------------ */
/* Äußere Komponente: löst Anfangszustand + Übernahme (anonym→Konto) auf */
/* ------------------------------------------------------------------ */

export function FlexCoverAntrag({
  isAuthenticated,
  userId,
  serverDraft,
}: {
  isAuthenticated: boolean;
  userId: string | null;
  serverDraft: DraftRow | null;
}) {
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const [migration, setMigration] = useState<{ local: LocalDraft; server: DraftRow } | null>(null);

  useEffect(() => {
    const local = readLocalDraft(FORM_ID);

    if (!isAuthenticated) {
      setResolved(
        local
          ? { values: local.data, section: local.activeSection ?? undefined, savedAt: local.updatedAt, updatedAt: null, loadedAt: local.updatedAt }
          : { values: {}, savedAt: null, updatedAt: null, loadedAt: null },
      );
      return;
    }

    // Eingeloggt: Übernahme-/Konfliktlogik
    if (local && !serverDraft) {
      // Lokalen Stand in den Account übernehmen.
      void adoptLocal(local.data, local.activeSection ?? null, local.updatedAt);
      return;
    }
    if (local && serverDraft) {
      setMigration({ local, server: serverDraft });
      return;
    }
    if (serverDraft) {
      setResolved({
        values: serverDraft.data,
        section: serverDraft.active_section ?? undefined,
        savedAt: serverDraft.updated_at,
        updatedAt: serverDraft.updated_at,
        loadedAt: serverDraft.updated_at,
      });
      return;
    }
    setResolved({ values: {}, savedAt: null, updatedAt: null, loadedAt: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function adoptLocal(
    data: FormValues,
    section: string | null,
    loadedAt: string,
  ) {
    const result = await saveServerDraft(FORM_ID, {
      data,
      activeSection: section,
      expectedUpdatedAt: null,
      force: true,
    });
    clearLocalDraft(FORM_ID);
    const updatedAt = result.status === "saved" ? result.draft.updated_at : null;
    toast.success("Dein zuvor begonnener Entwurf wurde in dein Konto übernommen.");
    setResolved({ values: data, section: section ?? undefined, savedAt: updatedAt, updatedAt, loadedAt });
  }

  async function chooseMigration(which: "local" | "server") {
    if (!migration) return;
    const { local, server } = migration;
    if (which === "server") {
      clearLocalDraft(FORM_ID);
      setMigration(null);
      setResolved({
        values: server.data,
        section: server.active_section ?? undefined,
        savedAt: server.updated_at,
        updatedAt: server.updated_at,
        loadedAt: server.updated_at,
      });
      return;
    }
    // lokalen Stand übernehmen (überschreibt den Server-Entwurf bewusst)
    setMigration(null);
    if (local) await adoptLocal(local.data, local.activeSection ?? null, local.updatedAt);
  }

  if (migration) {
    return (
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welchen Stand möchtest du fortsetzen?</DialogTitle>
            <DialogDescription>
              Es gibt einen lokal begonnenen Entwurf (zuletzt {formatDate(migration.local.updatedAt)})
              und einen in deinem Konto gespeicherten Entwurf (zuletzt {formatDate(migration.server.updated_at)}).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => void chooseMigration("server")}>
              Konto-Entwurf behalten
            </Button>
            <Button onClick={() => void chooseMigration("local")}>
              Lokalen Stand übernehmen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (!resolved) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <FlexCoverForm
      mode={isAuthenticated ? "server" : "local"}
      userId={userId}
      resolved={resolved}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Innere Komponente: Auto-Save + Status-UI + FormEngine               */
/* ------------------------------------------------------------------ */

function FlexCoverForm({
  mode,
  userId,
  resolved,
}: {
  mode: "local" | "server";
  userId: string | null;
  resolved: Resolved;
}) {
  const {
    status,
    lastSavedAt,
    conflictDraft,
    localUnavailable,
    notify,
    save,
    forceSave,
    discard,
  } = useDraftAutosave({
    formId: FORM_ID,
    mode,
    userId,
    initialUpdatedAt: resolved.updatedAt,
    initialSavedAt: resolved.savedAt,
  });

  const router = useRouter();

  // Anfangswerte + Remount-Key (für „Verwerfen" → leeres Formular).
  const [formValues, setFormValues] = useState<FormValues>(resolved.values);
  const [formSection, setFormSection] = useState<string | undefined>(resolved.section);
  const [formKey, setFormKey] = useState(0);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);

  // „PDF herunterladen" — für alle Nutzer. Erzeugung clientseitig (PII bleibt
  // lokal), ohne Referenznummer (es ist keine Einreichung). Die Engine liefert
  // bereits validierte, bereinigte Werte (alle sichtbaren Felder inkl. leer).
  async function handleDownloadPdf(values: FormValues) {
    try {
      const { generateFlexcoverPdf, flexcoverPdfFilename } = await import("@/lib/pdf");
      const blob = await generateFlexcoverPdf(values);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = flexcoverPdfFilename();
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF wurde erstellt und heruntergeladen.");
    } catch {
      toast.error("PDF konnte nicht erstellt werden. Bitte erneut versuchen.");
    }
  }

  // „Antrag einreichen" — nur eingeloggt. Protokolliert serverseitig, versendet
  // das PDF per E-Mail und leitet zur Bestätigungsseite. Bei Fehlern bleibt der
  // Entwurf erhalten (kein Datenverlust, keine falsche Bestätigung).
  async function handleEinreichen(values: FormValues) {
    setSubmitting(true);
    try {
      const result = await submitForm(FORM_ID, values, captchaToken);
      // Erfolg → zur Bestätigungsseite. Den E-Mail-Status übergeben wir per Query,
      // da er nicht in der DB liegt (kein submitting zurücksetzen, da Navigation).
      const mail = result.emailSent ? "sent" : "failed";
      router.push(`/antrag/flexcover/eingereicht/${result.id}?mail=${mail}`);
    } catch (err) {
      if (err instanceof SubmitError && err.status === 401) {
        toast.error("Sitzung abgelaufen — bitte erneut anmelden. Ihr Stand bleibt erhalten.");
      } else {
        toast.error(
          err instanceof Error && err.message
            ? err.message
            : "Antrag konnte nicht eingereicht werden. Bitte erneut versuchen.",
        );
      }
      // Turnstile-Token ist verbraucht → Widget neu laden für einen erneuten Versuch.
      setCaptchaToken("");
      setCaptchaKey((k) => k + 1);
      setSubmitting(false);
    }
  }

  async function handleDiscard() {
    await discard();
    setFormValues({});
    setFormSection(undefined);
    setNoticeDismissed(true);
    setFormKey((k) => k + 1);
    toast.success("Entwurf verworfen.");
  }

  // Beispieldatensatz laden: in lokaler Entwicklung ODER wenn auf einer Umgebung
  // explizit freigeschaltet (NEXT_PUBLIC_ENABLE_TESTDATA=1, z. B. Staging) —
  // niemals in Produktion (dort ist das Flag nicht gesetzt).
  const isDev =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_ENABLE_TESTDATA === "1";
  async function handleLoadSample() {
    const { flexcoverSampleData } = await import("@/lib/forms/flexcover/sample-data");
    setFormValues(flexcoverSampleData);
    setFormSection(undefined);
    setNoticeDismissed(true);
    setFormKey((k) => k + 1);
    toast.info("Testdaten geladen.");
  }

  const statusText = (() => {
    switch (status) {
      case "saving":
        return "Wird gespeichert…";
      case "saved":
        return mode === "local"
          ? `Lokal gesichert ${formatRelative(lastSavedAt)}`
          : `Gespeichert ${formatRelative(lastSavedAt)}`;
      case "error":
        return "Nicht gespeichert — erneut versuchen";
      case "sessionExpired":
        return "Sitzung abgelaufen";
      case "stale":
        return "Konflikt erkannt";
      default:
        return lastSavedAt
          ? mode === "local"
            ? `Lokal gesichert ${formatRelative(lastSavedAt)}`
            : `Gespeichert ${formatRelative(lastSavedAt)}`
          : mode === "local"
            ? "Wird lokal gesichert"
            : "Automatisches Speichern aktiv";
    }
  })();

  const header = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{flexcoverDefinition.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Füllen Sie den Antrag Abschnitt für Abschnitt aus. Ihre Eingaben werden
            automatisch {mode === "local" ? "im Browser" : "in Ihrem Konto"} gesichert.
          </p>
          {/* Dezente, klickbare Statuszeile (= „jetzt speichern"). */}
          <button
            type="button"
            onClick={save}
            disabled={status === "saving"}
            title="Klicken, um sofort zu speichern"
            aria-live="polite"
            className={`mt-1.5 inline-flex items-center gap-1.5 text-xs hover:underline disabled:no-underline ${
              status === "error" || status === "sessionExpired" || status === "stale"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === "saving"
                  ? "animate-pulse bg-muted-foreground"
                  : status === "error" || status === "sessionExpired" || status === "stale"
                    ? "bg-destructive"
                    : "bg-muted-foreground/50"
              }`}
            />
            {statusText}
          </button>
        </div>
        <div className="flex items-center gap-1">
          {isDev && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-muted-foreground"
              onClick={() => void handleLoadSample()}
              title="Nur in der Entwicklung sichtbar"
            >
              Testdaten laden
            </Button>
          )}
          {(lastSavedAt || resolved.loadedAt) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
                  Verwerfen
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Entwurf verwerfen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Der gespeicherte Entwurf wird gelöscht und das Formular geleert.
                    Dieser Schritt kann nicht rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void handleDiscard()}>
                    Verwerfen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {resolved.loadedAt && !noticeDismissed && (
        <Alert>
          <AlertTitle>Entwurf wiederhergestellt</AlertTitle>
          <AlertDescription>
            Wir haben Ihren Entwurf vom {formatDate(resolved.loadedAt)} geladen. Sie
            können dort weitermachen oder über „Verwerfen“ neu beginnen.
          </AlertDescription>
        </Alert>
      )}

      {localUnavailable && (
        <Alert variant="destructive">
          <AlertTitle>Automatisches Sichern nicht möglich</AlertTitle>
          <AlertDescription>
            Ihr Browser erlaubt gerade kein lokales Speichern (z. B. privater Modus).
            Das Formular funktioniert weiter, der Stand wird aber nicht zwischengespeichert.
          </AlertDescription>
        </Alert>
      )}

      {status === "sessionExpired" && (
        <Alert variant="destructive">
          <AlertTitle>Sitzung abgelaufen</AlertTitle>
          <AlertDescription>
            Bitte{" "}
            <Link href="/login?returnTo=/antrag/flexcover" className="underline">
              erneut anmelden
            </Link>
            . Ihr aktueller Stand bleibt lokal erhalten.
          </AlertDescription>
        </Alert>
      )}

      {status === "stale" && conflictDraft && (
        <Alert variant="destructive">
          <AlertTitle>Antrag wurde anderswo aktualisiert</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Es gibt einen neueren Stand (zuletzt {formatDate(conflictDraft.updated_at)}),
              z. B. aus einem anderen Tab oder Gerät.
            </p>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => window.location.reload()}>
                Neu laden
              </Button>
              <Button type="button" size="sm" onClick={forceSave}>
                Diesen Stand behalten
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  // Anonym: kein „Antrag einreichen", sondern ein Hinweis zur Anmeldung. Der
  // ausgefüllte Antrag lässt sich trotzdem als PDF herunterladen.
  const anonHint = (
    <Alert>
      <AlertTitle>Zum Einreichen bitte anmelden</AlertTitle>
      <AlertDescription>
        Eine verbindliche Einreichung mit Eingangsbestätigung und PDF-Zusendung
        per E-Mail ist nur mit Konto möglich.{" "}
        <Link href="/login?returnTo=/antrag/flexcover" className="font-medium underline">
          Anmelden
        </Link>{" "}
        oder{" "}
        <Link href="/registrieren?returnTo=/antrag/flexcover" className="font-medium underline">
          registrieren
        </Link>
        . Ihren vollständig ausgefüllten Antrag können Sie unten jederzeit als PDF
        herunterladen.
      </AlertDescription>
    </Alert>
  );

  // Eingeloggt: „Antrag einreichen" ist die primäre Aktion, „PDF herunterladen"
  // sekundär. Anonym: „PDF herunterladen" ist die einzige (primäre) Aktion.
  const isAuthed = mode === "server";

  // Bot-Schutz (PROJ-16) nur für die eingeloggte Einreichung.
  const einreichCaptcha = turnstileEnabled ? (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">
        Bitte bestätigen Sie kurz, dass Sie kein Roboter sind, um den Antrag einzureichen.
      </p>
      <TurnstileWidget
        key={captchaKey}
        onToken={setCaptchaToken}
        onExpire={() => setCaptchaToken("")}
      />
    </div>
  ) : undefined;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <FormEngine
        key={formKey}
        definition={flexcoverDefinition}
        defaultValues={formValues}
        initialSection={formSection}
        onStateChange={notify}
        onSubmit={isAuthed ? handleEinreichen : handleDownloadPdf}
        submitLabel={
          isAuthed
            ? submitting
              ? "Wird eingereicht…"
              : "Antrag einreichen"
            : "PDF herunterladen"
        }
        submitDisabled={isAuthed && (submitting || (turnstileEnabled && !captchaToken))}
        secondaryActions={
          isAuthed
            ? [
                {
                  key: "download",
                  label: "PDF herunterladen",
                  variant: "outline",
                  disabled: submitting,
                  onAction: handleDownloadPdf,
                },
              ]
            : undefined
        }
        actionsNote={isAuthed ? einreichCaptcha : anonHint}
        header={header}
      />
    </main>
  );
}
