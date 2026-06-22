// PROJ-6: Versand der Einreichungs-Bestätigung mit PDF-Anhang über Resend (EU).
// Best-effort: der Erfolg der Einreichung hängt NICHT am Mailversand. Diese
// Funktion wirft nicht und gibt nur true/false zurück. Es wird KEIN PII
// (E-Mail-Adresse, Antragsinhalt) geloggt — nur technische Fehlerkennungen.

import { Resend } from "resend";

interface SubmissionEmailArgs {
  to: string;
  reference: string;
  pdf: Buffer;
  filename: string;
}

/** Versendet die Bestätigungs-E-Mail. Liefert true bei erfolgreichem Versand. */
export async function sendSubmissionEmail({
  to,
  reference,
  pdf,
  filename,
}: SubmissionEmailArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SUBMISSION_EMAIL_FROM;
  if (!apiKey || !from) {
    console.error(
      "[submissions] E-Mail-Versand übersprungen: RESEND_API_KEY/SUBMISSION_EMAIL_FROM nicht konfiguriert.",
    );
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `Ihr flex&cover-Antrag – Referenz ${reference}`,
      text:
        `Vielen Dank für Ihre Einreichung.\n\n` +
        `Ihre Referenznummer: ${reference}\n\n` +
        `Ihr vollständiger Antrag ist als PDF angehängt. Bitte bewahren Sie ihn auf.\n\n` +
        `Diese E-Mail wurde automatisch erzeugt.`,
      attachments: [{ filename, content: pdf }],
    });
    if (error) {
      console.error("[submissions] E-Mail-Versand fehlgeschlagen:", error.name ?? "unbekannt");
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      "[submissions] E-Mail-Versand-Ausnahme:",
      err instanceof Error ? err.name : "unbekannt",
    );
    return false;
  }
}
