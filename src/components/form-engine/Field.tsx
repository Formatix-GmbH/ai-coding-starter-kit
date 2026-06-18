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

function FieldShell({
  id,
  label,
  required,
  help,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {help && !error && <p className="text-xs text-muted-foreground">{help}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function Field({ node, path }: { node: FieldNode; path: string }) {
  const { control, register, setValue, getFieldState, formState } =
    useFormContext<FieldValues>();
  const { registry, validateSingleField } = useFormEngine();
  const error = getFieldState(path, formState).error?.message as string | undefined;
  const id = path;

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
    return (
      <FieldShell id={id} label={node.label} help={node.help}>
        <Input id={id} value={result ?? ""} readOnly disabled />
      </FieldShell>
    );
  }

  const onBlur = () => validateSingleField(node, path);

  // Auswahl (Dropdown)
  if (node.type === "select") {
    return (
      <FieldShell id={id} label={node.label} required={node.required} help={node.help} error={error}>
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
              <SelectTrigger id={id}>
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
      <FieldShell id={id} label={node.label} required={node.required} help={node.help} error={error}>
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
              />
            )}
          />
          <Label htmlFor={id} className="font-normal">
            {node.label}
            {node.required && <span className="ml-0.5 text-destructive">*</span>}
          </Label>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  // Mehrzeiliger Text
  if (node.type === "textarea") {
    return (
      <FieldShell id={id} label={node.label} required={node.required} help={node.help} error={error}>
        <Textarea id={id} placeholder={node.placeholder} {...register(path)} onBlur={onBlur} />
      </FieldShell>
    );
  }

  // Standard-Eingaben (Text, E-Mail, Zahl, Währung, Prozent, Jahr, PLZ, Datum)
  const isNumeric = ["integer", "decimal", "currency", "percent"].includes(node.type);
  const inputType =
    node.type === "email" ? "email" : node.type === "date" ? "date" : "text";

  return (
    <FieldShell id={id} label={node.label} required={node.required} help={node.help} error={error}>
      <div className="relative">
        <Input
          id={id}
          type={inputType}
          inputMode={isNumeric || node.type === "year" ? "decimal" : undefined}
          placeholder={node.placeholder}
          className={node.type === "currency" ? "pr-7" : undefined}
          {...register(path)}
          onBlur={onBlur}
        />
        {node.type === "currency" && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            €
          </span>
        )}
        {node.type === "percent" && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            %
          </span>
        )}
      </div>
    </FieldShell>
  );
}
