"use client";

import { useRef } from "react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
  type FieldValues,
} from "react-hook-form";
import type { FormNode, TableColumn } from "@/lib/form-engine/types";
import { evaluateCondition } from "@/lib/form-engine/conditions";
import { joinPath } from "@/lib/form-engine/paths";
import { Field } from "./Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export function NodeRenderer({ node, base }: { node: FormNode; base: string }) {
  const values = useWatch<FieldValues>();
  if (!evaluateCondition(node.visibleWhen, (values as FieldValues) ?? {})) {
    return null;
  }

  if (node.kind === "field") {
    return <Field node={node} path={joinPath(base, node.key)} />;
  }

  if (node.kind === "group") {
    const groupBase = joinPath(base, node.key);
    if (node.inline) {
      // Feld-Kinder nebeneinander (Raster), übrige Kinder (z. B. Tabellen) darunter.
      const fieldChildren = node.children.filter((c) => c.kind === "field");
      const otherChildren = node.children.filter((c) => c.kind !== "field");
      return (
        <fieldset className="space-y-4 rounded-md border p-4">
          {node.label && (
            <legend className="px-1 text-sm font-medium">{node.label}</legend>
          )}
          {fieldChildren.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {fieldChildren.map((child) => (
                <NodeRenderer key={child.key} node={child} base={groupBase} />
              ))}
            </div>
          )}
          {otherChildren.map((child) => (
            <NodeRenderer key={child.key} node={child} base={groupBase} />
          ))}
        </fieldset>
      );
    }
    return (
      <fieldset className="space-y-4 rounded-md border p-4">
        {node.label && (
          <legend className="px-1 text-sm font-medium">{node.label}</legend>
        )}
        {node.children.map((child) => (
          <NodeRenderer key={child.key} node={child} base={groupBase} />
        ))}
      </fieldset>
    );
  }

  if (node.kind === "repeat") {
    return <RepeatGroup node={node} base={base} />;
  }

  return <TableView node={node} base={base} />;
}

function RepeatGroup({
  node,
  base,
}: {
  node: Extract<FormNode, { kind: "repeat" }>;
  base: string;
}) {
  const path = joinPath(base, node.key);
  const { control } = useFormContext<FieldValues>();
  const { fields, append, remove } = useFieldArray({ control, name: path });
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const canAdd = node.max === undefined || fields.length < node.max;
  const canRemove = (count: number) => node.min === undefined || count > node.min;
  const itemName = node.itemLabel ?? "Eintrag";

  const handleRemove = (index: number) => {
    remove(index);
    // Fokus nach dem Entfernen sinnvoll halten (sonst springt er an den
    // Seitenanfang/verschwindet): auf den „Hinzufügen"-Button setzen.
    requestAnimationFrame(() => addButtonRef.current?.focus());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{node.label}</h3>
        <Button
          ref={addButtonRef}
          type="button"
          variant="outline"
          size="sm"
          disabled={!canAdd}
          onClick={() => append({})}
        >
          <Plus aria-hidden className="mr-1 h-4 w-4" />
          {node.itemLabel ? `${node.itemLabel} hinzufügen` : "Hinzufügen"}
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Noch keine Einträge.
        </p>
      )}

      {fields.map((f, index) => (
        <div key={f.id} className="space-y-4 rounded-md border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {itemName} {index + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canRemove(fields.length)}
              onClick={() => handleRemove(index)}
              aria-label={`${itemName} ${index + 1} entfernen`}
            >
              <Trash2 aria-hidden className="h-4 w-4" />
            </Button>
          </div>
          {node.children.map((child) => (
            <NodeRenderer key={child.key} node={child} base={joinPath(path, index)} />
          ))}
        </div>
      ))}
    </div>
  );
}

function TableCell({
  path,
  type,
  options,
  ariaLabel,
}: {
  path: string;
  type: TableColumn["type"];
  options?: { value: string; label: string }[];
  ariaLabel: string;
}) {
  const { control, register, getFieldState, formState } = useFormContext<FieldValues>();
  const hasError = Boolean(getFieldState(path, formState).error);
  const errorClass = hasError ? "border-destructive" : undefined;

  if (type === "select") {
    return (
      <Controller
        control={control}
        name={path}
        render={({ field }) => (
          <Select value={(field.value as string) ?? ""} onValueChange={field.onChange}>
            <SelectTrigger
              className={errorClass}
              aria-label={ariaLabel}
              aria-invalid={hasError ? true : undefined}
            >
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {options?.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    );
  }

  const isNumeric = ["integer", "decimal", "currency", "percent", "year"].includes(type);
  const inputType = type === "date" ? "date" : type === "email" ? "email" : "text";
  return (
    <Input
      type={inputType}
      inputMode={isNumeric ? "decimal" : undefined}
      className={errorClass}
      aria-label={ariaLabel}
      aria-invalid={hasError ? true : undefined}
      {...register(path)}
    />
  );
}

function TableView({
  node,
  base,
}: {
  node: Extract<FormNode, { kind: "table" }>;
  base: string;
}) {
  const path = joinPath(base, node.key);
  const { control } = useFormContext<FieldValues>();
  const isDynamic = node.mode === "dynamic";
  const { fields, append, remove } = useFieldArray({
    control,
    name: isDynamic ? path : `${path}.__unused__`,
  });

  return (
    <div className="space-y-2">
      {node.label && <h3 className="text-sm font-medium">{node.label}</h3>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          {/* Caption verankert den Tabellennamen für Screenreader auch dann,
              wenn die sichtbare Überschrift visuell daneben steht. */}
          {node.label && <caption className="sr-only">{node.label}</caption>}
          <thead>
            <tr className="border-b">
              <th scope="col" className="p-2 text-left font-medium">
                <span className="sr-only">Bezeichnung</span>
              </th>
              {node.columns.map((col) => (
                <th key={col.key} scope="col" className="p-2 text-left font-medium">
                  {col.label}
                </th>
              ))}
              {isDynamic && (
                <th scope="col" className="p-2">
                  <span className="sr-only">Aktionen</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {!isDynamic &&
              (node.rows ?? []).map((row) => (
                <tr key={row.key} className="border-b">
                  <th scope="row" className="p-2 text-left font-medium text-muted-foreground">
                    {row.label}
                  </th>
                  {node.columns.map((col) => (
                    <td key={col.key} className="p-2">
                      <TableCell
                        path={joinPath(path, row.key, col.key)}
                        type={col.type}
                        ariaLabel={`${row.label} – ${col.label}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            {isDynamic &&
              fields.map((f, index) => (
                <tr key={f.id} className="border-b">
                  <th scope="row" className="p-2 font-medium text-muted-foreground">
                    {index + 1}
                  </th>
                  {node.columns.map((col) => (
                    <td key={col.key} className="p-2">
                      <TableCell
                        path={joinPath(path, index, col.key)}
                        type={col.type}
                        ariaLabel={`${col.label} (Zeile ${index + 1})`}
                      />
                    </td>
                  ))}
                  <td className="p-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      aria-label={`Zeile ${index + 1} entfernen`}
                    >
                      <Trash2 aria-hidden className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {isDynamic && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={node.max !== undefined && fields.length >= node.max}
          onClick={() => append({})}
        >
          <Plus aria-hidden className="mr-1 h-4 w-4" />
          {node.addLabel ?? "Zeile hinzufügen"}
        </Button>
      )}
    </div>
  );
}
