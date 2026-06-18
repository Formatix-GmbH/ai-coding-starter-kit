"use client";

import { createContext, useContext } from "react";
import type { FieldNode, FormDefinition } from "@/lib/form-engine/types";
import { HandlerRegistry } from "@/lib/form-engine/handlers";

export interface FormEngineContextValue {
  definition: FormDefinition;
  registry: HandlerRegistry;
  /** Validiert ein einzelnes Feld (z.B. onBlur) und setzt/löscht den Fehler. */
  validateSingleField: (node: FieldNode, path: string) => void;
}

const FormEngineContext = createContext<FormEngineContextValue | null>(null);

export const FormEngineProvider = FormEngineContext.Provider;

export function useFormEngine(): FormEngineContextValue {
  const ctx = useContext(FormEngineContext);
  if (!ctx) throw new Error("useFormEngine must be used within FormEngineProvider");
  return ctx;
}
