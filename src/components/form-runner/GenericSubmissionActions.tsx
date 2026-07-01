"use client";

// PROJ-18: Generische Aktionen auf der Bestätigungsseite (PDF, E-Mail erneut
// senden, Korrigieren, neuer Antrag). Analog zu FlexCovers Variante, aber über
// formId + basePath parametrisiert.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GenericSubmissionPdfButton } from "./GenericSubmissionPdfButton";
import { resendSubmissionEmail } from "@/lib/submissions/client";
import { saveServerDraft } from "@/lib/drafts/client";
import type { FormValues } from "@/lib/form-engine/types";

export function GenericSubmissionActions({
  formId,
  basePath,
  submissionId,
  reference,
  data,
  recipientEmail,
  emailSent,
}: {
  formId: string;
  basePath: string;
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

  async function handleCorrect() {
    setCorrecting(true);
    const res = await saveServerDraft(formId, { data, activeSection: null, expectedUpdatedAt: null, force: true });
    if (res.status === "saved") {
      router.push(basePath);
    } else {
      setCorrecting(false);
      toast.error("Der Antrag konnte nicht zum Korrigieren geöffnet werden.");
    }
  }

  return (
    <div className="space-y-4">
      {sent ? (
        <p className="text-sm text-muted-foreground">
          Eine Kopie mit dem PDF wurde
          {recipientEmail ? <> an <span className="font-medium">{recipientEmail}</span></> : null}{" "}
          gesendet.{" "}
          <button type="button" onClick={handleResend} disabled={resending} className="underline hover:no-underline disabled:opacity-60">
            {resending ? "Wird gesendet…" : "Erneut senden"}
          </button>
        </p>
      ) : (
        <Alert variant="destructive">
          <AlertTitle>E-Mail konnte nicht zugestellt werden</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Bitte laden Sie Ihr PDF hier herunter und bewahren Sie es auf. Sie können die Zustellung erneut versuchen.</p>
            <Button type="button" size="sm" onClick={handleResend} disabled={resending}>
              {resending ? "Wird gesendet…" : "E-Mail erneut senden"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        <GenericSubmissionPdfButton formId={formId} data={data} reference={reference} variant="default" />
        <Button type="button" variant="outline" onClick={handleCorrect} disabled={correcting}>
          {correcting ? "Wird geöffnet…" : "Korrigieren / erneut einreichen"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push(basePath)}>Neuen Antrag stellen</Button>
        <Button asChild type="button" variant="ghost">
          <Link href={`${basePath}/eingereicht`}>Meine Einreichungen</Link>
        </Button>
      </div>
    </div>
  );
}
