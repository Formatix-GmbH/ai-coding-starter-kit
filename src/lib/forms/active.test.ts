import { describe, it, expect, afterEach } from "vitest";
import { getActiveFormIds, isFormActive } from "./active";

// PROJ-18: Der Docker-Build übergibt nicht gesetzte Build-Args als LEERSTRING —
// der muss wie „nicht gesetzt" auf den FlexCover-Default fallen (sonst wären in
// Prod alle Formulare 404).

const ORIG = process.env.NEXT_PUBLIC_ACTIVE_FORMS;

afterEach(() => {
  if (ORIG === undefined) delete process.env.NEXT_PUBLIC_ACTIVE_FORMS;
  else process.env.NEXT_PUBLIC_ACTIVE_FORMS = ORIG;
});

describe("getActiveFormIds", () => {
  it("Default (nicht gesetzt) = flexcover", () => {
    delete process.env.NEXT_PUBLIC_ACTIVE_FORMS;
    expect(getActiveFormIds()).toEqual(["flexcover"]);
  });

  it("LEERSTRING fällt auf den Default zurück (Docker-Build-Arg)", () => {
    process.env.NEXT_PUBLIC_ACTIVE_FORMS = "";
    expect(getActiveFormIds()).toEqual(["flexcover"]);
    expect(isFormActive("flexcover")).toBe(true);
  });

  it("Kommaliste wird getrimmt und gefiltert", () => {
    process.env.NEXT_PUBLIC_ACTIVE_FORMS = " musterantrag , flexcover ,, ";
    expect(getActiveFormIds()).toEqual(["musterantrag", "flexcover"]);
  });

  it("Portal-Konfiguration: nur musterantrag aktiv → flexcover inaktiv", () => {
    process.env.NEXT_PUBLIC_ACTIVE_FORMS = "musterantrag";
    expect(isFormActive("musterantrag")).toBe(true);
    expect(isFormActive("flexcover")).toBe(false);
  });
});
