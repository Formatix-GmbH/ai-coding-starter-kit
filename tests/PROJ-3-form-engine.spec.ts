import { test, expect, type Locator, type Page } from "@playwright/test";

// PROJ-3 — Dynamic Form Engine, getestet gegen die Demo unter /form-demo.

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

test.beforeEach(async ({ page }) => {
  await page.goto("/form-demo");
  await expect(page.getByRole("tab", { name: "Kontakt" })).toBeVisible();
});

test("rendert das Formular als Tabs aus der Definition", async ({ page }) => {
  await expect(page.getByRole("tab", { name: "Kontakt" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Firma" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Zahlen" })).toBeVisible();
});

test("dynamische Sichtbarkeit: Beschreibung erscheint nur bei Verlagerung = Ja", async ({ page }) => {
  await page.getByRole("tab", { name: "Firma" }).click();
  await expect(byId(page, "firma.beschreibungVerlagerung")).toHaveCount(0);
  await clickUntil(
    page.locator('[id="firma.verlagerung-ja"]'),
    byId(page, "firma.beschreibungVerlagerung"),
  );
});

test("Validierung: leeres Absenden zeigt Pflichtfeld-Fehler + Toast", async ({ page }) => {
  await page.getByRole("button", { name: "Absenden" }).click();
  await expect(page.getByText(/korrigieren/)).toBeVisible();
  // Kontakt ist der aktive Tab → Pflichtfeld-Meldungen sichtbar
  await expect(page.getByText("Pflichtfeld").first()).toBeVisible();
});

test("berechnetes Feld: Summe = a + b", async ({ page }) => {
  await page.getByRole("tab", { name: "Zahlen" }).click();
  await fillStable(byId(page, "zahlen.a"), "10");
  await fillStable(byId(page, "zahlen.b"), "20");
  await expect(byId(page, "zahlen.summe")).toHaveValue("30");
});

test("Custom-Validator: a + b > 100 wird beim Absenden gemeldet", async ({ page }) => {
  await page.getByRole("tab", { name: "Zahlen" }).click();
  await fillStable(byId(page, "zahlen.a"), "60");
  await fillStable(byId(page, "zahlen.b"), "50");
  await page.getByRole("button", { name: "Absenden" }).click();
  await page.getByRole("tab", { name: "Zahlen" }).click();
  await expect(page.getByText(/darf 100 nicht überschreiten/)).toBeVisible();
});

test("verschachtelte Wiederholgruppen: Begünstigter mit innerem Ansprechpartner", async ({ page }) => {
  await page.getByRole("tab", { name: "Firma" }).click();
  // Wiederholgruppe einblenden
  await clickUntil(
    page.locator('[id="firma.weitereBeguenstigte-ja"]'),
    page.getByRole("button", { name: /Begünstigter hinzufügen/ }),
  );
  // Äußere Instanz hinzufügen
  await clickUntil(
    page.getByRole("button", { name: /Begünstigter hinzufügen/ }),
    byId(page, "firma.beguenstigte.0.firmierung"),
  );
  // Innere (verschachtelte) Instanz hinzufügen
  await clickUntil(
    page.getByRole("button", { name: /Ansprechpartner hinzufügen/ }),
    byId(page, "firma.beguenstigte.0.ansprechpartner.0.name"),
  );
  await expect(byId(page, "firma.beguenstigte.0.ansprechpartner.0.name")).toBeVisible();
});

test("dynamische Tabelle: Land hinzufügen erzeugt eine Zeile", async ({ page }) => {
  await page.getByRole("tab", { name: "Zahlen" }).click();
  await clickUntil(
    page.getByRole("button", { name: /Land hinzufügen/ }),
    page.locator('[name="zahlen.laender.0.land"]'),
  );
  await expect(page.locator('[name="zahlen.laender.0.betrag"]')).toBeVisible();
});

test("Zurücksetzen leert die Eingaben (nach Bestätigung)", async ({ page }) => {
  await fillStable(byId(page, "kontakt.email"), "test@firma.de");
  await page.getByRole("button", { name: "Zurücksetzen" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Zurücksetzen" }).click();
  await expect(byId(page, "kontakt.email")).toHaveValue("");
});

test("erfolgreiches Absenden bei gültigen Pflichtfeldern", async ({ page }) => {
  // Anrede (Select) wählen
  await byId(page, "kontakt.anrede").click();
  await page.getByRole("option", { name: "Frau" }).click();
  await fillStable(byId(page, "kontakt.email"), "test@firma.de");
  await page.getByRole("button", { name: "Absenden" }).click();
  await expect(page.getByText(/abgesendet/)).toBeVisible();
});
