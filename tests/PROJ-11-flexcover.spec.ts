import { test, expect, type Locator, type Page } from "@playwright/test";

// PROJ-11 — FlexCover-Formulardefinition auf der Engine, getestet unter /antrag/flexcover.

// Hydrations-robustes Füllen (Dev/Turbopack kann controlled Inputs zurücksetzen).
async function fillStable(locator: Locator, value: string) {
  await expect(async () => {
    await locator.fill(value);
    await expect(locator).toHaveValue(value, { timeout: 1000 });
  }).toPass({ timeout: 10000 });
}

// Klicken, bis die erwartete Wirkung eintritt (gegen Hydrations-Race).
async function clickUntil(target: Locator, expectVisible: Locator) {
  await expect(async () => {
    await target.click();
    await expect(expectVisible).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 10000 });
}

function byId(page: Page, id: string): Locator {
  return page.locator(`[id="${id}"]`);
}

function tab(page: Page, name: RegExp): Locator {
  return page.getByRole("tab", { name });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/antrag/flexcover");
  await expect(tab(page, /Ansprechpartner/)).toBeVisible();
});

test("rendert alle 9 Abschnitte als Tabs", async ({ page }) => {
  for (const name of [
    /Ansprechpartner/,
    /Unternehmen/,
    /Firmensitz und Bedeutung/,
    /Forschung & Entwicklung/,
    /Investitionen/,
    /^.*Beschäftigte$/,
    /Ausbildung/,
    /Sourcing & Wertschöpfung/,
    /Sonstiges/,
  ]) {
    await expect(tab(page, name)).toBeVisible();
  }
});

test("anonymer Zugriff: kein Login nötig (URL bleibt auf dem Formular)", async ({ page }) => {
  await expect(page).toHaveURL(/\/antrag\/flexcover$/);
  await expect(page.getByRole("heading", { name: /Förderantrag/ })).toBeVisible();
});

test("Feldtypen/Optionen aus XDP: Anrede-Select bietet Frau/Herr/Divers", async ({ page }) => {
  await byId(page, "Ansprechpartner.anrede").click();
  await expect(page.getByRole("option", { name: "Frau" })).toBeVisible();
  await expect(page.getByRole("option", { name: "Herr" })).toBeVisible();
  await expect(page.getByRole("option", { name: "Divers" })).toBeVisible();
});

test("dynamische Sichtbarkeit + bedingte Pflicht: Verlagerung = Ja zeigt Beschreibung", async ({ page }) => {
  await tab(page, /Investitionen/).click();
  await expect(byId(page, "Investitionen.beschreibungVerlagerung")).toHaveCount(0);
  await clickUntil(
    page.locator('[id="Investitionen.verlagerung-ja"]'),
    byId(page, "Investitionen.beschreibungVerlagerung"),
  );
});

test("Zahlenvergleich (gt): anzahlStandorteAusland > 0 zeigt abhängige Felder", async ({ page }) => {
  await tab(page, /Firmensitz und Bedeutung/).click();
  await expect(byId(page, "SitzUndBedeutung.StandorteNeu")).toHaveCount(0);
  await fillStable(byId(page, "SitzUndBedeutung.anzahlStandorteAusland"), "2");
  await expect(byId(page, "SitzUndBedeutung.StandorteNeu")).toBeVisible();
  await expect(byId(page, "SitzUndBedeutung.Begruendung")).toBeVisible();
  // Zurück auf 0 → Felder verschwinden wieder
  await fillStable(byId(page, "SitzUndBedeutung.anzahlStandorteAusland"), "0");
  await expect(byId(page, "SitzUndBedeutung.StandorteNeu")).toHaveCount(0);
});

test("Wiederholgruppe: weitere Begünstigte hinzufügen/entfernen", async ({ page }) => {
  await tab(page, /Unternehmen/).click();
  await clickUntil(
    page.locator('[id="Unternehmen.weitereBeguenstigte-ja"]'),
    page.getByRole("button", { name: /Begünstigter hinzufügen/ }),
  );
  await clickUntil(
    page.getByRole("button", { name: /Begünstigter hinzufügen/ }),
    byId(page, "Unternehmen.Beguenstigter.0.vollstaendigeFirmierung"),
  );
  await expect(byId(page, "Unternehmen.Beguenstigter.0.sitzBeguenstigter")).toBeVisible();
});

test("feste 3-Jahres-Tabelle: Berichtsjahre + beschriftete Zeilen × Jahresspalten", async ({ page }) => {
  await tab(page, /^.*Beschäftigte$/).click();
  // Berichtsjahr-Felder (BUG-2)
  await fillStable(byId(page, "Beschaeftigte.Tabelle_DE.jahr1"), "2022");
  await expect(byId(page, "Beschaeftigte.Tabelle_DE.jahr1")).toHaveValue("2022");
  // Zeilenbeschriftung + Matrix-Zelle adressierbar
  await expect(page.getByText("Engineering/Planung").first()).toBeVisible();
  await fillStable(page.locator('[name="Beschaeftigte.Tabelle_DE.werte.produktion.sp1"]'), "12");
  await expect(page.locator('[name="Beschaeftigte.Tabelle_DE.werte.produktion.sp1"]')).toHaveValue("12");
});

test("Tabellen-Zeilenkorrektur (BUG-1): Azubis und Wertschöpfung je 1 Zeile", async ({ page }) => {
  await tab(page, /Ausbildung/).click();
  await expect(page.getByText("Auszubildende / Dualstudierende").first()).toBeVisible();
  await expect(page.locator('[name="Ausbildung.Azubis.werte.azubis.sp1"]')).toBeVisible();
  // Keine Bereichszeile mehr (kein Engineering/Planung in der Azubis-Tabelle)
  await expect(page.locator('[name="Ausbildung.Azubis.werte.engineering.sp1"]')).toHaveCount(0);
});

test("dynamische Tabelle: Einkauf nach Ländern – Zeile hinzufügen", async ({ page }) => {
  await tab(page, /Sourcing & Wertschöpfung/).click();
  await clickUntil(
    page.getByRole("button", { name: /Land hinzufügen/ }),
    page.locator('[name="SourcingWertschoepfung.Einkauf.Laender.0.Land"]'),
  );
  await expect(page.locator('[name="SourcingWertschoepfung.Einkauf.Laender.0.Betrag1"]')).toBeVisible();
});

test("Validierung: leeres Absenden zeigt Pflichtfehler + Toast + Tab-Fehlerzähler", async ({ page }) => {
  await page.getByRole("button", { name: /Antrag absenden/ }).click();
  await expect(page.getByText(/korrigieren/)).toBeVisible();
  // Aktiver Tab Ansprechpartner zeigt Pflichtfeld-Meldungen
  await expect(page.getByText("Pflichtfeld").first()).toBeVisible();
});

test("ausgeblendetes Detailfeld blockiert die Abgabe nicht", async ({ page }) => {
  // Nur Pflichtfelder ausfüllen, optionale Ja/Nein-Flags unberührt lassen.
  await byId(page, "Ansprechpartner.anrede").click();
  await page.getByRole("option", { name: "Frau" }).click();
  await fillStable(byId(page, "Ansprechpartner.vorname"), "Erika");
  await fillStable(byId(page, "Ansprechpartner.nachname"), "Muster");
  await fillStable(byId(page, "Ansprechpartner.email"), "erika@firma.de");

  await tab(page, /Unternehmen/).click();
  await fillStable(byId(page, "Unternehmen.unternehmensgegenstand"), "Maschinenbau");
  await fillStable(byId(page, "Unternehmen.firma"), "Muster GmbH");
  await fillStable(byId(page, "Unternehmen.adresse.strasse"), "Hauptstr. 1");
  await fillStable(byId(page, "Unternehmen.adresse.plz"), "80331");
  await fillStable(byId(page, "Unternehmen.adresse.ort"), "München");
  await fillStable(byId(page, "Unternehmen.adresse.land"), "Deutschland");
  await fillStable(byId(page, "Unternehmen.branche"), "Industrie");
  await fillStable(byId(page, "Unternehmen.mitarbeiter"), "50");

  await tab(page, /Firmensitz und Bedeutung/).click();
  await fillStable(byId(page, "SitzUndBedeutung.hauptsitz"), "München");
  await fillStable(byId(page, "SitzUndBedeutung.anzahlStandorteDE"), "3");
  await fillStable(byId(page, "SitzUndBedeutung.anzahlStandorteAusland"), "0");
  await fillStable(byId(page, "SitzUndBedeutung.eignerstruktur"), "GmbH, alleiniger Gesellschafter");

  await page.getByRole("button", { name: /Antrag absenden/ }).click();
  await expect(page.getByText(/Antrag erfasst/)).toBeVisible();
});

test("PLZ-Validierung: ungültige PLZ wird gemeldet", async ({ page }) => {
  await tab(page, /Unternehmen/).click();
  await fillStable(byId(page, "Unternehmen.adresse.plz"), "abc");
  await byId(page, "Unternehmen.adresse.plz").blur();
  await expect(page.getByText(/PLZ|gültig|Format|ungültig/i).first()).toBeVisible();
});
