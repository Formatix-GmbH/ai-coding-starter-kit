"use client";

// PROJ-6: Interaktive Aktionen auf der Bestätigungsseite — PDF-Download, E-Mail
// erneut senden, Korrigieren (frischen Entwurf aus dem Snapshot anlegen) und
// neuen Antrag starten.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DownloadSubmissionPdfButton } from "./DownloadSubmissionPdfButton";
import { resendSubmissionEmail } from "@/lib/submissions/client";
import { saveServerDraft } from "@/lib/drafts/client";
import type { FormValues } from "@/lib/form-engine/types";

export function SubmissionConfirmationActions({
  formId,
  submissionId,
  reference,
  data,
  recipientEmail,
  emailSent,
}: {
  formId: string;
  submissionId: string;
  reference: string;
  data: FormValues;
  recipientEmail: string | null;
  emailSent: boolean;
}) {
  const router = useRouter();
  const [sent, setSent] = useState(emailSent);
  const [resending, setResending] = useState(false);
  const [correcting, setCorrecting] = useState(false);

  async function handleResend() {
    setResending(true);
    const ok = await resendSubmissionEmail(formId, submissionId);
    setResending(false);
    if (ok) {
      setSent(true);
      toast.success("E-Mail wurde erneut gesendet.");
    } else {
      toast.error("E-Mail konnte nicht gesendet werden. Bitte später erneut versuchen.");
    }
  }

  // Korrigieren: Snapshot als frischen Entwurf speichern und zurück ins Formular.
  async function handleCorrect() {
    setCorrecting(true);
    const res = await saveServerDraft(formId, {
      data,
      activeSection: null,
      expectedUpdatedAt: null,
      force: true,
    });
    if (res.status === "saved") {
      router.push("/antrag/flexcover");
    } else {
      setCorrecting(false);
      toast.error("Der Antrag konnte nicht zum Korrigieren geöffnet werden.");
    }
  }

  return (
    <div className="space-y-4">
      {/* E-Mail-Status */}
      {sent ? (
        <p className="text-sm text-muted-foreground">
          Eine Kopie mit dem PDF wurde
          {recipientEmail ? <> an <span className="font-medium">{recipientEmail}</span></> : null}{" "}
          gesendet.{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="underline hover:no-underline disabled:opacity-60"
          >
            {resending ? "Wird gesendet…" : "Erneut senden"}
          </button>
        </p>
      ) : (
        <Alert variant="destructive">
          <AlertTitle>E-Mail konnte nicht zugestellt werden</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Bitte laden Sie Ihr PDF hier herunter und bewahren Sie es auf. Sie
              können die Zustellung erneut versuchen.
            </p>
            <Button type="button" size="sm" onClick={handleResend} disabled={resending}>
              {resending ? "Wird gesendet…" : "E-Mail erneut senden"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Aktionen */}
      <div className="flex flex-wrap gap-2">
        <DownloadSubmissionPdfButton data={data} reference={reference} variant="default" />
        <Button type="button" variant="outline" onClick={handleCorrect} disabled={correcting}>
          {correcting ? "Wird geöffnet…" : "Korrigieren / erneut einreichen"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/antrag/flexcover")}>
          Neuen Antrag stellen
        </Button>
        <Button asChild type="button" variant="ghost">
          <Link href="/antrag/flexcover/eingereicht">Meine Einreichungen</Link>
        </Button>
      </div>
    </div>
  );
}
