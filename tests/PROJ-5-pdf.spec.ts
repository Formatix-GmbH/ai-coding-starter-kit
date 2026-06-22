import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

// PROJ-5 — PDF-Generierung & Download (clientseitig). Anonymer Flow über den
// Dev-Button „Testdaten laden" (vollständiger gültiger Datensatz).

function byId(page: Page, id: string) {
  return page.locator(`[id="${id}"]`);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/antrag/flexcover");
  await expect(byId(page, "Ansprechpartner.email")).toBeVisible();
});

test("gültiger Antrag erzeugt einen PDF-Download (anonym, clientseitig)", async ({ page }) => {
  // Vollständige, gültige Daten laden
  await page.getByRole("button", { name: "Testdaten laden" }).click();
  await expect(byId(page, "Ansprechpartner.email")).toHaveValue("erika.mustermann@muster-gmbh.de", {
    timeout: 8000,
  });

  // Absenden → Download abfangen
  const downloadPromise = page.waitForEvent("download", { timeout: 20000 });
  await page.getByRole("button", { name: /Antrag absenden/ }).click();
  const download = await downloadPromise;

  // Dateiname + echtes PDF
  expect(download.suggestedFilename()).toMatch(/^flexcover-antrag-\d{4}-\d{2}-\d{2}\.pdf$/);
  const path = await download.path();
  const buf = fs.readFileSync(path);
  expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  expect(buf.length).toBeGreaterThan(3000);

  await expect(page.getByText(/PDF wurde erstellt|heruntergeladen/)).toBeVisible();
});

test("unvollständiger Antrag erzeugt kein PDF und zeigt Validierungsfehler", async ({ page }) => {
  let downloadStarted = false;
  page.on("download", () => {
    downloadStarted = true;
  });

  await page.getByRole("button", { name: /Antrag absenden/ }).click();

  // Validierungs-Hinweis erscheint, kein Erfolgs-Toast
  await expect(page.getByText(/korrigieren/)).toBeVisible();
  await expect(page.getByText(/PDF wurde erstellt/)).toHaveCount(0);
  expect(downloadStarted).toBe(false);
  // Eingaben bleiben erhalten (Formular weiterhin sichtbar)
  await expect(byId(page, "Ansprechpartner.email")).toBeVisible();
});
