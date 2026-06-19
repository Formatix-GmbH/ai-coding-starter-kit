import { test, expect, type Locator, type Page } from "@playwright/test";

// PROJ-4 — Entwurf & Auto-Save. E2E deckt den anonymen localStorage-Flow ab
// (ohne Login zuverlässig testbar). Server-Entwürfe/Konflikt/Übernahme sind durch
// API-Integrationstests + Hook-Unit-Tests abgedeckt.

async function fillStable(locator: Locator, value: string) {
  await expect(async () => {
    await locator.fill(value);
    await expect(locator).toHaveValue(value, { timeout: 1000 });
  }).toPass({ timeout: 10000 });
}

function byId(page: Page, id: string): Locator {
  return page.locator(`[id="${id}"]`);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/antrag/flexcover");
  await expect(byId(page, "Ansprechpartner.email")).toBeVisible();
});

test("anonym: Eingaben werden lokal gesichert und nach Reload wiederhergestellt", async ({ page }) => {
  await fillStable(byId(page, "Ansprechpartner.email"), "anon@firma.de");
  // Auto-Save (debounced) → Status zeigt „Lokal gesichert"
  await expect(page.getByText(/Lokal gesichert/)).toBeVisible({ timeout: 8000 });

  await page.reload();
  await expect(byId(page, "Ansprechpartner.email")).toHaveValue("anon@firma.de", {
    timeout: 10000,
  });
  // Hinweis auf wiederhergestellten Entwurf
  await expect(page.getByText("Entwurf wiederhergestellt")).toBeVisible();
});

test("anonym: Verwerfen leert das Formular und entfernt den lokalen Entwurf", async ({ page }) => {
  await fillStable(byId(page, "Ansprechpartner.email"), "weg@firma.de");
  await expect(page.getByText(/Lokal gesichert/)).toBeVisible({ timeout: 8000 });

  await page.getByRole("button", { name: "Verwerfen" }).first().click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Verwerfen" }).click();

  await expect(byId(page, "Ansprechpartner.email")).toHaveValue("");
  // Auch nach Reload bleibt es leer (lokaler Entwurf wurde gelöscht)
  await page.reload();
  await expect(byId(page, "Ansprechpartner.email")).toHaveValue("");
});

test("anonym: dezente Statuszeile ist anklickbar (sofort speichern)", async ({ page }) => {
  await fillStable(byId(page, "Ansprechpartner.email"), "sofort@firma.de");
  // Statuszeile ist ein Button → sofort speichern auslösen
  const status = page.getByRole("button", { name: /gesichert|gespeichert|speicher/i }).first();
  await status.click();
  await expect(page.getByText(/Lokal gesichert/)).toBeVisible({ timeout: 8000 });
});
