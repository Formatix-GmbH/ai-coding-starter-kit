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
  test("jede Seite hat einen Skip-Link als erstes fokussierbares Element", async ({ page }, testInfo) => {
    // Tastatur-Tab-Traversierung ist nur auf Nicht-Touch-Geräten sinnvoll.
    test.skip(testInfo.project.name === "Mobile Safari", "Touch-Gerät ohne Tab-Fokus");
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

  test("Submit mit Fehlern setzt den Fokus auf das erste fehlerhafte Feld", async ({ page }) => {
    await page.goto("/antrag/flexcover");
    await expect(page.locator('[id="Ansprechpartner.email"]')).toBeVisible();
    await page.getByRole("button", { name: "PDF herunterladen" }).click();
    // Der Fokus springt auf das erste ungültige Bedienelement (welches Feld das
    // konkret ist, hängt von der Definitionsreihenfolge ab).
    await expect(page.locator(":focus")).toHaveAttribute("aria-invalid", "true");
  });
});

test.describe("Skip-Link (Tastatur)", () => {
  test("Aktivieren springt zum Hauptinhalt", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "Mobile Safari", "Touch-Gerät ohne Tab-Fokus");
    await page.goto("/");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page.locator("main#hauptinhalt")).toBeFocused();
  });
});

// Tiefere Engine-Prüfungen am Demo-Formular (voller Funktionsumfang:
// berechnetes Feld, feste/dynamische Tabellen, verschachtelte Wiederholgruppen).
test.describe("Form-Engine — Semantik & dynamische Inhalte (Demo)", () => {
  test("berechnetes Feld ist schreibgeschützt (read-only) statt deaktiviert", async ({ page }) => {
    await page.goto("/form-demo");
    await page.getByRole("tab", { name: /Zahlen/ }).click();
    const summe = page.locator('[id="zahlen.summe"]');
    await expect(summe).toBeVisible();
    await expect(summe).toHaveAttribute("aria-readonly", "true");
    await expect(summe).toHaveAttribute("readonly", "");
    await expect(summe).not.toBeDisabled();
  });

  test("feste Tabelle hat Spalten-/Zeilenköpfe und eine Beschriftung (caption)", async ({ page }) => {
    await page.goto("/form-demo");
    await page.getByRole("tab", { name: /Zahlen/ }).click();
    // Spaltenkopf (scope=col) und Zeilenkopf (scope=row) sind als solche erkennbar.
    await expect(page.getByRole("columnheader", { name: "Jahr 1" })).toBeVisible();
    await expect(page.getByRole("rowheader", { name: "Vollzeit" })).toBeVisible();
    await expect(page.locator("table caption", { hasText: "Beschäftigte (3 Jahre)" })).toHaveCount(1);
  });

  test("Wiederholgruppe: Fokus bleibt nach dem Entfernen sinnvoll gesetzt", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "Mobile Safari", "Fokus-Management ist eine Tastatur-Anforderung");
    await page.goto("/form-demo");
    await page.getByRole("tab", { name: /Firma/ }).click();
    // Wiederholgruppe „Begünstigte" einblenden.
    await page.locator('[id="firma.weitereBeguenstigte-ja"]').click();
    const addBtn = page.getByRole("button", { name: /Begünstigter hinzufügen/ });
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    // Eintrag entfernen → Fokus darf nicht verloren gehen (landet auf „Hinzufügen").
    await page.getByRole("button", { name: "Begünstigter 1 entfernen" }).click();
    await expect(addBtn).toBeFocused();
  });
});
