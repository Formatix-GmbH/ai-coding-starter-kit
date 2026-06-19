"use client";

import Link from "next/link";
import { toast } from "sonner";
import { FormEngine } from "@/components/form-engine/FormEngine";
import { flexcoverDefinition } from "@/lib/forms/flexcover/definition";
import { pruneHiddenValues } from "@/lib/form-engine/output";
import type { FormValues } from "@/lib/form-engine/types";
import { Button } from "@/components/ui/button";

export default function FlexCoverAntragPage() {
  function handleSubmit(values: FormValues) {
    // Ausgabe ist XSD-konform strukturiert (Element-Namen/Verschachtelung wie
    // flexcover_antrag_X.xsd). PDF-Erzeugung & Download docken hier an (PROJ-5).
    const output = pruneHiddenValues(flexcoverDefinition, values);
    toast.success("Antrag erfasst. Die PDF-Erstellung folgt mit PROJ-5.");
    console.log("FlexCover-Ausgabe (XSD-konform):", output);
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
