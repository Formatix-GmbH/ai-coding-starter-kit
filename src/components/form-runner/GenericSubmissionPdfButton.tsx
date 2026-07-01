"use client";

// PROJ-18: Generischer Download-Button für ein eingereichtes PDF (mit Referenz),
// clientseitig aus dem Snapshot erzeugt (PII bleibt lokal). Registry-gesteuert.

import { useState, type ComponentProps } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { FormValues } from "@/lib/form-engine/types";

export function GenericSubmissionPdfButton({
  formId,
  data,
  reference,
  variant = "outline",
  size,
  label = "PDF herunterladen",
}: {
  formId: string;
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
      const { generateFormPdfBlob, formPdfFilename } = await import("@/lib/pdf/client");
      const blob = await generateFormPdfBlob(formId, data, reference);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = formPdfFilename(formId, reference);
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
