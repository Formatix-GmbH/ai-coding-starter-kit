"use client";

import { useMemo, useState } from "react";
import {
  FormProvider,
  useForm,
  useWatch,
  type FieldErrors,
  type FieldValues,
} from "react-hook-form";
import { toast } from "sonner";
import type { FieldNode, FormDefinition, FormValues, SectionNode } from "@/lib/form-engine/types";
import { HandlerRegistry, emptyRegistry } from "@/lib/form-engine/handlers";
import { validateForm, validateField } from "@/lib/form-engine/validation";
import { pruneHiddenValues, buildEmptyValues } from "@/lib/form-engine/output";
import { evaluateCondition } from "@/lib/form-engine/conditions";
import { FormEngineProvider } from "./context";
import { NodeRenderer } from "./nodes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

/** Flacht das RHF-Fehlerobjekt zu Pfaden ab (für Fehlerzähler pro Abschnitt). */
function flattenErrorPaths(errors: FieldErrors, base = ""): string[] {
  const paths: string[] = [];
  for (const [key, val] of Object.entries(errors ?? {})) {
    if (!val) continue;
    const path = base ? `${base}.${key}` : key;
    if (typeof (val as { message?: unknown }).message === "string") {
      paths.push(path);
    } else if (typeof val === "object") {
      paths.push(...flattenErrorPaths(val as FieldErrors, path));
    }
  }
  return paths;
}

export interface FormEngineProps {
  definition: FormDefinition;
  registry?: HandlerRegistry;
  defaultValues?: FormValues;
  onSubmit?: (values: FormValues) => void;
}

export function FormEngine({
  definition,
  registry = emptyRegistry,
  defaultValues = {},
  onSubmit,
}: FormEngineProps) {
  const methods = useForm<FieldValues>({
    defaultValues: defaultValues as FieldValues,
    mode: "onSubmit",
  });
  const { getValues, setError, clearErrors, reset, control, formState } = methods;

  const validateSingleField = (node: FieldNode, path: string) => {
    const msg = validateField(node, getValues(path), getValues() as FormValues, registry);
    if (msg) setError(path, { type: "validate", message: msg });
    else clearErrors(path);
  };

  const handleSubmit = () => {
    const values = getValues() as FormValues;
    const errs = validateForm(definition, values, registry);
    clearErrors();
    const paths = Object.keys(errs);
    if (paths.length > 0) {
      for (const p of paths) setError(p, { type: "validate", message: errs[p] });
      toast.error(`Bitte ${paths.length} Eingabe(n) korrigieren.`);
      return;
    }
    const output = pruneHiddenValues(definition, values);
    onSubmit?.(output);
  };

  const handleReset = () => {
    // Auf ein vollständiges leeres Gerüst zurücksetzen, damit alle registrierten
    // Felder zuverlässig geleert werden (reset({}) lässt Felder sonst stehen).
    reset(buildEmptyValues(definition) as FieldValues);
    clearErrors();
  };

  // Reaktive Werte für Sicht­barkeit der Abschnitte + Fehlerzähler je Reiter
  const watched = useWatch({ control }) as FieldValues;
  const visibleSections = useMemo(
    () => definition.sections.filter((s) => evaluateCondition(s.visibleWhen, (watched as FormValues) ?? {})),
    [definition.sections, watched],
  );
  const errorCountBySection = useMemo(() => {
    const all = flattenErrorPaths(formState.errors);
    const map: Record<string, number> = {};
    for (const s of definition.sections) {
      map[s.key] = all.filter((p) => p === s.key || p.startsWith(`${s.key}.`)).length;
    }
    return map;
  }, [formState.errors, definition.sections]);

  return (
    <FormEngineProvider value={{ definition, registry, validateSingleField }}>
      <FormProvider {...methods}>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} noValidate>
          {definition.layout === "tabs" && (
            <TabsLayout
              sections={visibleSections}
              errorCounts={errorCountBySection}
            />
          )}
          {definition.layout === "single" && (
            <SingleLayout sections={visibleSections} />
          )}
          {definition.layout === "wizard" && (
            <WizardLayout
              sections={visibleSections}
              registry={registry}
              definition={definition}
              getValues={() => getValues() as FormValues}
              setError={setError}
              clearErrors={clearErrors}
            />
          )}

          <FormActions definition={definition} onReset={handleReset} />
        </form>
      </FormProvider>
    </FormEngineProvider>
  );
}

function SectionBody({ section }: { section: SectionNode }) {
  return (
    <div className="space-y-5">
      {section.children.map((child) => (
        <NodeRenderer key={child.key} node={child} base={section.key} />
      ))}
    </div>
  );
}

function TabsLayout({
  sections,
  errorCounts,
}: {
  sections: SectionNode[];
  errorCounts: Record<string, number>;
}) {
  if (sections.length === 0) return null;
  return (
    <Tabs defaultValue={sections[0].key} className="w-full">
      <TabsList className="flex h-auto flex-wrap justify-start">
        {sections.map((s) => (
          <TabsTrigger key={s.key} value={s.key} className="gap-2">
            {s.title}
            {errorCounts[s.key] > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5">
                {errorCounts[s.key]}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {sections.map((s) => (
        <TabsContent key={s.key} value={s.key} className="pt-4">
          <SectionBody section={s} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function SingleLayout({ sections }: { sections: SectionNode[] }) {
  return (
    <div className="space-y-8">
      {sections.map((s) => (
        <section key={s.key} className="space-y-4">
          <h2 className="border-b pb-1 text-lg font-semibold">{s.title}</h2>
          <SectionBody section={s} />
        </section>
      ))}
    </div>
  );
}

function WizardLayout({
  sections,
  registry,
  definition,
  getValues,
  setError,
  clearErrors,
}: {
  sections: SectionNode[];
  registry: HandlerRegistry;
  definition: FormDefinition;
  getValues: () => FormValues;
  setError: ReturnType<typeof useForm>["setError"];
  clearErrors: ReturnType<typeof useForm>["clearErrors"];
}) {
  const [step, setStep] = useState(0);
  const current = sections[step];
  if (!current) return null;

  const goNext = () => {
    // Aktuellen Abschnitt validieren, bevor weitergegangen wird.
    const values = getValues();
    const all = validateForm(definition, values, registry);
    const sectionErrors = Object.keys(all).filter(
      (p) => p === current.key || p.startsWith(`${current.key}.`),
    );
    clearErrors();
    if (sectionErrors.length > 0) {
      for (const p of sectionErrors) setError(p, { type: "validate", message: all[p] });
      toast.error("Bitte diesen Abschnitt zuerst vervollständigen.");
      return;
    }
    setStep((s) => Math.min(s + 1, sections.length - 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{current.title}</span>
        <span>Schritt {step + 1} von {sections.length}</span>
      </div>
      <SectionBody section={current} />
      <div className="flex justify-between">
        <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Zurück
        </Button>
        {step < sections.length - 1 && (
          <Button type="button" onClick={goNext}>Weiter</Button>
        )}
      </div>
    </div>
  );
}

function FormActions({
  definition,
  onReset,
}: {
  definition: FormDefinition;
  onReset: () => void;
}) {
  return (
    <div className="mt-6 flex items-center justify-between border-t pt-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="ghost">
            {definition.resetLabel ?? "Zurücksetzen"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Formular zurücksetzen?</AlertDialogTitle>
            <AlertDialogDescription>
              Alle Eingaben gehen verloren. Dieser Schritt kann nicht rückgängig
              gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={onReset}>Zurücksetzen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button type="submit">{definition.submitLabel ?? "Versenden"}</Button>
    </div>
  );
}
