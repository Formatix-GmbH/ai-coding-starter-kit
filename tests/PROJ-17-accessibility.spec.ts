import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// PROJ-17 — Barrierefreiheit (WCAG 2.1 AA). Automatisierte Regressionsprüfung
// mit axe-core gegen jede anonym erreichbare Antragsteller-Seite. axe deckt nur
// einen Teil der Kriterien ab; der vollständige Nachweis (Tastatur + NVDA) wird
// in der QA manuell dokumentiert.

// Anonym erreichbare Flächen (eingeloggte Seiten leiten ohne Session zum Login).
const PAGES = [
  { path: "/", name: "Startseite" },
  { path: "/antrag/flexcover", name: "Antragsformular (Engine)" },
  { path: "/login", name: "Login" },
  { path: "/registrieren", name: "Registrierung" },
  { path: "/passwort-vergessen", name: "Passwort vergessen" },
  { path: "/datenschutz", name: "Datenschutz" },
  { path: "/barrierefreiheit", name: "Barrierefreiheitserklärung" },
];

// Auf WCAG 2.1 A/AA einschränken (Maßstab des Features).
async function analyze(page: Page) {
  return new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
}

for (const { path, name } of PAGES) {
  test(`${name} (${path}) hat keine kritischen/schweren axe-Verstöße`, async ({ page }) => {
    await page.goto(path);
    const results = await analyze(page);
    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    // Aussagekräftige Fehlermeldung: betroffene Regeln auflisten.
    expect(
      blocking,
      blocking.map((v) => `${v.id} (${v.impact}): ${v.help}`).join("\n"),
    ).toEqual([]);
  });
}

test.describe("Globale Struktur", () => {
  test("jede Seite hat einen Skip-Link als erstes fokussierbares Element", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveText("Zum Inhalt springen");
    await expect(focused).toHaveAttribute("href", "#hauptinhalt");
  });

  test("der Hauptinhalt ist eine main-Landmark mit dem Sprungziel", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("main#hauptinhalt");
    await expect(main).toHaveCount(1);
  });

  test("der globale Footer verlinkt auf die Barrierefreiheitserklärung", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Barrierefreiheit" })).toBeVisible();
  });
});

test.describe("Form-Engine — Fehlerführung", () => {
  test("Pflichtfeld ist programmatisch als erforderlich gekennzeichnet", async ({ page }) => {
    await page.goto("/antrag/flexcover");
    // E-Mail des Ansprechpartners ist ein Pflichtfeld.
    const email = page.locator('[id="Ansprechpartner.email"]');
    await expect(email).toBeVisible();
    await expect(email).toHaveAttribute("aria-required", "true");
  });

  test("Submit mit Fehlern verknüpft Feld und Fehlermeldung (aria-invalid + describedby)", async ({ page }) => {
    await page.goto("/antrag/flexcover");
    const email = page.locator('[id="Ansprechpartner.email"]');
    await expect(email).toBeVisible();
    // Anonym ist die primäre Aktion „PDF herunterladen" — sie läuft durch dieselbe
    // Validierung. Absenden ohne Pflichteingaben muss Fehler markieren.
    await page.getByRole("button", { name: "PDF herunterladen" }).click();
    await expect(email).toHaveAttribute("aria-invalid", "true");
    const describedBy = await email.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    // Die referenzierte Fehlermeldung existiert und hat Textinhalt.
    // Attribut-Selektor, da die ID einen Punkt enthält (kein CSS-Klassentrenner).
    const errorId = (describedBy as string).split(" ")[0];
    const msg = page.locator(`[id="${errorId}"]`);
    await expect(msg).toHaveText(/.+/);
  });
});
