"use client";

// PROJ-19: Aufklappbare Feld-/Tabellen-Erklärung („Was ist hier gemeint?").
// Eingeklappt als Standard; Radix Collapsible liefert die A11y-Mechanik
// (aria-expanded/aria-controls). Der sichtbare Auslöser-Text bleibt Teil des
// zugänglichen Namens (WCAG 2.5.3), der Feldbezug kommt als sr-only-Zusatz.

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Info } from "lucide-react";

export function Explanation({ label, text }: { label: string; text: string }) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline">
        <Info aria-hidden className="h-3.5 w-3.5" />
        Was ist hier gemeint?
        <span className="sr-only"> — Erklärung zu: {label}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-1.5 rounded-md border bg-muted/40 p-3">
          <p className="text-sm leading-relaxed">{text}</p>
          <p className="mt-2 text-xs text-muted-foreground">Unverbindliche Ausfüllhilfe</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
