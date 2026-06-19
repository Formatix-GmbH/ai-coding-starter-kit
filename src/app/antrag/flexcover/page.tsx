"use client";

import Link from "next/link";
import { toast } from "sonner";
import { FormEngine } from "@/components/form-engine/FormEngine";
import { flexcoverDefinition } from "@/lib/forms/flexcover/definition";
import type { FormValues } from "@/lib/form-engine/types";
import { Button } from "@/components/ui/button";

export default function FlexCoverAntragPage() {
  function handleSubmit(_values: FormValues) {
    // Die Engine liefert hier bereits XSD-konform strukturierte, von ausgeblendeten
    // Feldern bereinigte Werte. PDF-Erzeugung & Download docken an diesem Submit-
    // Event an (PROJ-5). Hinweis (DSGVO): bewusst kein Logging der Daten (PII).
    toast.success("Antrag erfasst. Die PDF-Erstellung folgt mit PROJ-5.");
  }

  const header = (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{flexcoverDefinition.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Füllen Sie den Antrag Abschnitt für Abschnitt aus. Pflichtfelder sind
          mit <span className="text-destructive">*</span> markiert. Ein Konto ist
          zum Ausfüllen nicht erforderlich.
        </p>
      </div>
      <Button asChild variant="ghost" size="sm">
        <Link href="/">Zurück</Link>
      </Button>
    </div>
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <FormEngine
        definition={flexcoverDefinition}
        onSubmit={handleSubmit}
        header={header}
      />
    </main>
  );
}
