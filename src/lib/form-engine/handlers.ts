import type { FormValues } from "./types";

/** Kontext, den Custom-Handler erhalten. */
export interface HandlerContext {
  /** Gesamte Formularwerte. */
  values: FormValues;
}

/** Berechnungs-Handler: liefert einen Wert. */
export type CalcHandler = (ctx: HandlerContext) => number | string | null;

/** Validierungs-Handler: liefert eine Fehlermeldung oder null (= ok). */
export type ValidateHandler = (
  value: unknown,
  ctx: HandlerContext,
) => string | null;

/**
 * Registry für benannte Custom-Handler (Modell A).
 * Logik liegt als geprüfter Projektcode vor; Definitionen verweisen per Name.
 * Bewusst isomorph: dieselbe Registry kann client- und serverseitig genutzt werden.
 * (Erweiterungsstelle für Modell B: hier könnte später ein Sandbox-Ausführer andocken.)
 */
export class HandlerRegistry {
  private calcs = new Map<string, CalcHandler>();
  private validators = new Map<string, ValidateHandler>();

  registerCalc(name: string, fn: CalcHandler): this {
    this.calcs.set(name, fn);
    return this;
  }

  registerValidator(name: string, fn: ValidateHandler): this {
    this.validators.set(name, fn);
    return this;
  }

  getCalc(name: string): CalcHandler | undefined {
    return this.calcs.get(name);
  }

  getValidator(name: string): ValidateHandler | undefined {
    return this.validators.get(name);
  }
}

export const emptyRegistry = new HandlerRegistry();
