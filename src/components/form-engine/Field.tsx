"use client";

import { useEffect } from "react";
import {
  Controller,
  useFormContext,
  useWatch,
  type FieldValues,
} from "react-hook-form";
import type { FieldNode } from "@/lib/form-engine/types";
import { computeValue } from "@/lib/form-engine/calculations";
import { useFormEngine } from "./context";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Explanation } from "./Explanation";

/** Stabile, ableitbare IDs für Hilfetext/Fehlertext/Beschriftung eines Feldes. */
function fieldIds(id: string) {
  return {
    labelId: `${id}-label`,
    helpId: `${id}-help`,
    errorId: `${id}-error`,
  };
}

/** Baut die ARIA-Eigenschaften, die jedes Bedienelement bekommt, damit
 *  Screenreader Pflicht, Fehlerzustand und die zugehörige Meldung/Hilfe
 *  programmatisch ermitteln können. */
function ariaProps({
  id,
  required,
  hasError,
  hasHelp,
}: {
  id: string;
  required?: boolean;
  hasError: boolean;
  hasHelp: boolean;
}) {
  const { helpId, errorId } = fieldIds(id);
  // Fehlertext ersetzt den Hilfetext in der Anzeige → entsprechend verknüpfen.
  const describedBy = hasError ? errorId : hasHelp ? helpId : undefined;
  return {
    "aria-invalid": hasError ? (true as const) : undefined,
    "aria-required": required ? (true as const) : undefined,
    "aria-describedby": describedBy,
  };
}

function FieldShell({
  id,
  label,
  required,
  help,
  explanation,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  explanation?: string;
  error?: string;
  children: React.ReactNode;
}) {
  const { labelId, helpId, errorId } = fieldIds(id);
  return (
    <div className="space-y-1.5">
      <Label id={labelId} htmlFor={id}>
        {label}
        {required && (
          <span className="ml-0.5 text-destructive">
            *<span className="sr-only"> (Pflichtfeld)</span>
          </span>
        )}
      </Label>
      {explanation && <Explanation label={label} text={explanation} />}
      {children}
      {help && !error && (
        <p id={helpId} className="text-sm text-muted-foreground">
          {help}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function Field({ node, path }: { node: FieldNode; path: string }) {
  const { control, register, setValue, getFieldState, formState } =
    useFormContext<FieldValues>();
  const { registry, validateSingleField } = useFormEngine();
  const error = getFieldState(path, formState).error?.message as string | undefined;
  const id = path;
  const { labelId } = fieldIds(id);
  const a11y = ariaProps({
    id,
    required: node.required,
    hasError: Boolean(error),
    hasHelp: Boolean(node.help),
  });

  // Berechnete (read-only) Felder
  const allValues = useWatch<FieldValues>();
  useEffect(() => {
    if (!node.computed) return;
    const result = computeValue(node.computed, allValues ?? {}, registry);
    setValue(path, result, { shouldValidate: false, shouldDirty: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(allValues), node.computed]);

  if (node.computed) {
    const result = computeValue(node.computed, allValues ?? {}, registry);
    // Schreibgeschützt statt deaktiviert: der Wert bleibt für Tastatur und
    // Screenreader wahrnehmbar und wird als „nur lesbar" angekündigt.
    return (
      <FieldShell id={id} label={node.label} help={node.help} explanation={node.explanation}>
        <Input
          id={id}
          value={result ?? ""}
          readOnly
          aria-readonly
          className="bg-muted"
          aria-describedby={node.help ? fieldIds(id).helpId : undefined}
        />
      </FieldShell>
    );
  }

  const onBlur = () => validateSingleField(node, path);

  // Auswahl (Dropdown)
  if (node.type === "select") {
    return (
      <FieldShell id={id} label={node.label} required={node.required} help={node.help} explanation={node.explanation} error={error}>
        <Controller
          control={control}
          name={path}
          render={({ field }) => (
            <Select
              value={(field.value as string) ?? ""}
              onValueChange={(v) => {
                field.onChange(v);
                validateSingleField(node, path);
              }}
            >
              <SelectTrigger id={id} {...a11y}>
                <SelectValue placeholder={node.placeholder ?? "Bitte wählen"} />
              </SelectTrigger>
              <SelectContent>
                {node.options?.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FieldShell>
    );
  }

  // Ja/Nein (Radio), optional mit leerer Möglichkeit über das Nicht-Auswählen
  if (node.type === "yesno" || node.type === "yesno_optional") {
    return (
      <FieldShell id={id} label={node.label} required={node.required} help={node.help} explanation={node.explanation} error={error}>
        <Controller
          control={control}
          name={path}
          render={({ field }) => (
            <RadioGroup
              value={(field.value as string) ?? ""}
              onValueChange={(v) => {
                field.onChange(v);
                validateSingleField(node, path);
              }}
              className="flex gap-6"
              // Die Radiogruppe trägt selbst Beschriftung, Pflicht- und Fehlerbezug,
              // da das einzelne Element keine <label for>-Verknüpfung hat.
              aria-labelledby={labelId}
              {...a11y}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Ja" id={`${id}-ja`} />
                <Label htmlFor={`${id}-ja`} className="font-normal">Ja</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Nein" id={`${id}-nein`} />
                <Label htmlFor={`${id}-nein`} className="font-normal">Nein</Label>
              </div>
            </RadioGroup>
          )}
        />
      </FieldShell>
    );
  }

  // Checkbox (einzeln)
  if (node.type === "checkbox") {
    const { errorId } = fieldIds(id);
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name={path}
            render={({ field }) => (
              <Checkbox
                id={id}
                checked={Boolean(field.value)}
                onCheckedChange={(c) => {
                  field.onChange(c === true);
                  validateSingleField(node, path);
                }}
                aria-required={node.required ? true : undefined}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
              />
            )}
          />
          <Label htmlFor={id} className="font-normal">
            {node.label}
            {node.required && (
              <span className="ml-0.5 text-destructive">
                *<span className="sr-only"> (Pflichtfeld)</span>
              </span>
            )}
          </Label>
        </div>
        {error && (
          <p id={errorId} className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }

  // Mehrzeiliger Text
  if (node.type === "textarea") {
    return (
      <FieldShell id={id} label={node.label} required={node.required} help={node.help} explanation={node.explanation} error={error}>
        <Textarea id={id} placeholder={node.placeholder} {...a11y} {...register(path)} onBlur={onBlur} />
      </FieldShell>
    );
  }

  // Standard-Eingaben (Text, E-Mail, Zahl, Währung, Prozent, Jahr, PLZ, Datum)
  const isNumeric = ["integer", "decimal", "currency", "percent"].includes(node.type);
  const inputType =
    node.type === "email" ? "email" : node.type === "date" ? "date" : "text";

  return (
    <FieldShell id={id} label={node.label} required={node.required} help={node.help} explanation={node.explanation} error={error}>
      <div className="relative">
        <Input
          id={id}
          type={inputType}
          inputMode={isNumeric || node.type === "year" ? "decimal" : undefined}
          placeholder={node.placeholder}
          className={node.type === "currency" ? "pr-7" : undefined}
          {...a11y}
          {...register(path)}
          onBlur={onBlur}
        />
        {node.type === "currency" && (
          <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            €
          </span>
        )}
        {node.type === "percent" && (
          <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            %
          </span>
        )}
      </div>
    </FieldShell>
  );
}
