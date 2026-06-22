"use client";

// PROJ-6: Lädt das eingereichte PDF (MIT Referenznummer) herunter — clientseitig
// aus dem Snapshot erzeugt (PII bleibt lokal). Geteilt von Bestätigungsseite und
// Einreichungs-Liste.

import { useState, type ComponentProps } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { FormValues } from "@/lib/form-engine/types";

export function DownloadSubmissionPdfButton({
  data,
  reference,
  variant = "outline",
  size,
  label = "PDF herunterladen",
}: {
  data: FormValues;
  reference: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function handleDownload() {
    setBusy(true);
    try {
      const { generateFlexcoverPdf, flexcoverPdfFilename } = await import("@/lib/pdf");
      const blob = await generateFlexcoverPdf(data, reference);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = flexcoverPdfFilename(new Date(), reference);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("PDF konnte nicht erstellt werden. Bitte erneut versuchen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button type="button" variant={variant} size={size} disabled={busy} onClick={handleDownload}>
      {busy ? "PDF wird erstellt…" : label}
    </Button>
  );
}
