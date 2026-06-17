import { test, expect, type Locator } from "@playwright/test";

// PROJ-2 — User Authentication
// Hinweis: Es wird bewusst KEIN vollständig gültiges Registrierungs-/Login-
// Formular abgesendet, das echte Konten anlegen würde. Getestet werden
// Validierungs-Fehlerpfade (clientseitig, erreichen Supabase nicht),
// Routenschutz und neutrale (enumeration-sichere) Antworten.

// Füllt ein Feld hydrations-robust: Im Dev-Modus (Turbopack) kann React den
// controlled Input nach dem ersten fill zurücksetzen, wenn die Hydration noch
// läuft. Daher fill + Wert prüfen mit Retry (kein Produktfehler, nur Dev-Timing).
async function fillStable(locator: Locator, value: string) {
  await expect(async () => {
    await locator.fill(value);
    await expect(locator).toHaveValue(value, { timeout: 1000 });
  }).toPass({ timeout: 10000 });
}

test.describe("Öffentlicher Zugang & Routenschutz", () => {
  test("anonyme Startseite ist ohne Login erreichbar", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /FlexCover-Förderantrag/ }),
    ).toBeVisible();
  });

  test("geschützte Seite leitet nicht eingeloggte Nutzer zum Login (mit returnTo)", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?returnTo=%2Fdashboard/);
    await expect(page.getByRole("button", { name: "Anmelden" })).toBeVisible();
  });

  test("Datenschutzseite rendert mit Version", async ({ page }) => {
    await page.goto("/datenschutz");
    await expect(
      page.getByRole("heading", { name: "Datenschutzerklärung" }),
    ).toBeVisible();
    await expect(page.getByText(/Version 2026-06-17/)).toBeVisible();
  });
});

test.describe("Registrierung — Validierung", () => {
  test("ohne Consent-Häkchen erscheint ein Hinweis", async ({ page }) => {
    await page.goto("/registrieren");
    await fillStable(page.getByLabel("Name"), "Test Nutzer");
    await fillStable(page.getByLabel("E-Mail"), "test@firma.de");
    await fillStable(page.getByLabel("Passwort", { exact: true }), "abcdef12");
    await fillStable(page.getByLabel("Passwort bestätigen"), "abcdef12");
    await page.getByRole("button", { name: "Konto erstellen" }).click();
    await expect(page.getByText(/Datenschutzerklärung zu/)).toBeVisible();
  });

  test("ungültige E-Mail wird abgelehnt", async ({ page }) => {
    await page.goto("/registrieren");
    await fillStable(page.getByLabel("E-Mail"), "keine-email");
    await page.getByRole("button", { name: "Konto erstellen" }).click();
    await expect(page.getByText(/gültige E-Mail-Adresse/)).toBeVisible();
  });

  test("zu schwaches Passwort wird abgelehnt", async ({ page }) => {
    await page.goto("/registrieren");
    await fillStable(page.getByLabel("Passwort", { exact: true }), "abc");
    await page.getByRole("button", { name: "Konto erstellen" }).click();
    await expect(page.getByText(/Mindestens 8 Zeichen/)).toBeVisible();
  });

  test("nicht übereinstimmende Passwörter werden abgelehnt", async ({ page }) => {
    // Alle anderen Felder gültig, damit der objektweite Passwort-Vergleich
    // (Zod .refine) überhaupt ausgeführt wird und nur der Mismatch übrig bleibt.
    // Das Formular bleibt dadurch ungültig → kein Supabase-Aufruf.
    await page.goto("/registrieren");
    await fillStable(page.getByLabel("Name"), "Test Nutzer");
    await fillStable(page.getByLabel("E-Mail"), "test@firma.de");
    await fillStable(page.getByLabel("Passwort", { exact: true }), "abcdef12");
    await fillStable(page.getByLabel("Passwort bestätigen"), "anders12");
    await page.getByRole("checkbox").click();
    await page.getByRole("button", { name: "Konto erstellen" }).click();
    await expect(page.getByText(/stimmen nicht überein/)).toBeVisible();
  });

  test("Passwort-Stärkeanzeige erscheint bei Eingabe", async ({ page }) => {
    await page.goto("/registrieren");
    await fillStable(page.getByLabel("Passwort", { exact: true }), "abcdef12");
    await expect(page.getByText(/Passwortstärke:/)).toBeVisible();
  });
});

test.describe("Login & Passwort-Reset", () => {
  test("Login mit leeren Feldern zeigt Validierungsfehler", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Anmelden" }).click();
    await expect(page.getByText(/E-Mail ist erforderlich/)).toBeVisible();
  });

  test("Passwort vergessen liefert neutrale Bestätigung (kein Enumeration)", async ({
    page,
  }) => {
    await page.goto("/passwort-vergessen");
    await fillStable(page.getByLabel("E-Mail"), "nichtexistent@example.test");
    await page.getByRole("button", { name: "Link anfordern" }).click();
    await expect(
      page.getByText(/Falls ein Konto mit dieser Adresse existiert/),
    ).toBeVisible();
  });

  test("Navigation zwischen Login und Registrierung", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Konto erstellen" }).click();
    await expect(page).toHaveURL(/\/registrieren/);
    await page.getByRole("link", { name: "Anmelden" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
