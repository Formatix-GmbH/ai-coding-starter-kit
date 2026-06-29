import { test, expect, type Page, type Locator } from "@playwright/test";

// PROJ-6 — Einreichung & Bestätigung. E2E deckt den anonym beobachtbaren Teil und
// die Auth-Guards ab (zuverlässig ohne Login testbar). Der eingeloggte
// Einreichungs-Flow (POST, Protokollierung, PDF/E-Mail, Bestätigung, Liste) ist
// durch die API-Integrationstests + manuelle Abnahme abgedeckt.

function byId(page: Page, id: string): Locator {
  return page.locator(`[id="${id}"]`);
}

test.describe("Antragsseite (anonym)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/antrag/flexcover");
    await expect(byId(page, "Ansprechpartner.email")).toBeVisible();
  });

  test("anonym sieht den Anmelde-Hinweis statt eines Einreichen-Buttons", async ({ page }) => {
    await expect(page.getByText("Zum Einreichen bitte anmelden")).toBeVisible();
    // Auf den Hinweis-Bereich eingrenzen (die globale Kopfzeile hat ebenfalls Auth-Links).
    const hint = page.getByRole("alert").filter({ hasText: "Zum Einreichen bitte anmelden" });
    await expect(hint.getByRole("link", { name: "Anmelden" })).toBeVisible();
    await expect(hint.getByRole("link", { name: "registrieren" })).toBeVisible();
    // Kein „Antrag einreichen"-Button für anonyme Nutzer.
    await expect(page.getByRole("button", { name: "Antrag einreichen" })).toHaveCount(0);
  });

  test("anonym kann den Antrag weiterhin als PDF herunterladen (Button vorhanden)", async ({ page }) => {
    await expect(page.getByRole("button", { name: "PDF herunterladen" })).toBeVisible();
  });
});

test.describe("Auth-Guards (anonym wird zum Login geleitet)", () => {
  test("Einreichungs-Liste erfordert Anmeldung", async ({ page }) => {
    await page.goto("/antrag/flexcover/eingereicht");
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/returnTo=.*eingereicht/);
  });

  test("Bestätigungsseite erfordert Anmeldung", async ({ page }) => {
    await page.goto("/antrag/flexcover/eingereicht/123e4567-e89b-42d3-a456-426614174000");
    await expect(page).toHaveURL(/\/login/);
  });
});
