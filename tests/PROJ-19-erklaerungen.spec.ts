import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// PROJ-19 — Feld-Erklärungen (Stufe 1: Musterantrag, Abschnitt „Vorhaben").
// Selbst-guardend wie PROJ-18: Musterantrag-Tests laufen nur im Portal-Modus
// (NEXT_PUBLIC_ACTIVE_FORMS=musterantrag), die FlexCover-Regression nur im
// Default-Modus. In der jeweils anderen Konfiguration überspringen sie sich.

// Als Regex-Quelle escaped („?" ist ein Regex-Sonderzeichen).
const TRIGGER = "Was ist hier gemeint\\?";

async function portalActive(page: Page): Promise<boolean> {
  const resp = await page.goto("/antrag/musterantrag");
  return resp?.status() === 200;
}

async function openVorhaben(page: Page): Promise<void> {
  await page.goto("/antrag/musterantrag");
  await expect(page.getByRole("button", { name: "Testdaten laden" })).toBeVisible();
  await page.getByRole("tab", { name: /Vorhaben/ }).click();
}

test("Erklärungs-Auslöser erscheinen an den vorgesehenen Feldern (eingeklappt)", async ({ page }) => {
  test.skip(!(await portalActive(page)), "Kein Portal-Deployment");
  await openVorhaben(page);
  // 10 Erklärungen im Abschnitt „Vorhaben" — 9 initial sichtbar (die 10. hängt
  // am bedingt eingeblendeten Feld „Beschreibung der intern. Zusammenarbeit").
  const triggers = page.getByRole("button", { name: new RegExp(TRIGGER) });
  await expect(triggers).toHaveCount(9);
  // Eingeklappt: kein Erklärtext/Disclaimer sichtbar.
  await expect(page.getByText("Unverbindliche Ausfüllhilfe")).toHaveCount(0);
});

test("Aufklappen zeigt Text + Disclaimer; Zustand ist programmatisch erkennbar; Schließen geht", async ({ page }) => {
  test.skip(!(await portalActive(page)), "Kein Portal-Deployment");
  await openVorhaben(page);
  const trigger = page.getByRole("button", { name: /Erklärung zu: Eingesetzte Eigenmittel/ });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText(/Eigenmittel zeigen, dass Sie hinter dem Vorhaben stehen/)).toBeVisible();
  await expect(page.getByText("Unverbindliche Ausfüllhilfe")).toBeVisible();
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("Unverbindliche Ausfüllhilfe")).toHaveCount(0);
});

test("Felder ohne Erklärung haben keinen Auslöser (z. B. Titel des Vorhabens)", async ({ page }) => {
  test.skip(!(await portalActive(page)), "Kein Portal-Deployment");
  await openVorhaben(page);
  const titel = page.locator('[id="vorhaben.titel"]');
  await expect(titel).toBeVisible();
  // Der Feld-Container des Titels enthält keinen Erklärungs-Auslöser.
  const container = page.locator("div", { has: titel }).filter({ hasText: "Titel des Vorhabens" }).last();
  await expect(container.getByRole("button", { name: new RegExp(TRIGGER) })).toHaveCount(0);
});

test("Bedingtes Feld: Erklärung erscheint mit dem Feld (internationale Zusammenarbeit)", async ({ page }) => {
  test.skip(!(await portalActive(page)), "Kein Portal-Deployment");
  await openVorhaben(page);
  await page.locator('[id="vorhaben.international-ja"]').click();
  await expect(page.locator('[id="vorhaben.beschreibungInternational"]')).toBeVisible();
  const triggers = page.getByRole("button", { name: new RegExp(TRIGGER) });
  await expect(triggers).toHaveCount(10);
});

test("Tabellen-Erklärung sitzt am Kopf (einmal je Tabelle) und Eingaben bleiben unberührt", async ({ page }) => {
  test.skip(!(await portalActive(page)), "Kein Portal-Deployment");
  await openVorhaben(page);
  const trigger = page.getByRole("button", { name: /Erklärung zu: Meilensteine/ });
  await expect(trigger).toHaveCount(1);
  await trigger.click();
  await expect(page.getByText(/überprüfbares Zwischenergebnis mit Termin/)).toBeVisible();
  // Eingabe funktioniert bei offener Erklärung weiter.
  await page.locator('[id="vorhaben.titel"]').fill("Testtitel");
  await expect(page.locator('[id="vorhaben.titel"]')).toHaveValue("Testtitel");
});

test("axe: Abschnitt „Vorhaben“ mit aufgeklappter Erklärung ohne kritische/schwere Verstöße", async ({ page }, testInfo) => {
  test.skip(!(await portalActive(page)), "Kein Portal-Deployment");
  test.skip(testInfo.project.name === "Mobile Safari", "axe-Kernprüfung auf Desktop");
  await openVorhaben(page);
  await page.getByRole("button", { name: /Erklärung zu: Eingesetzte Eigenmittel/ }).click();
  await expect(page.getByText("Unverbindliche Ausfüllhilfe")).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const blocking = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  expect(blocking, blocking.map((v) => `${v.id} (${v.impact}): ${v.help}`).join("\n")).toEqual([]);
});

test("Edge-Case: Erklärung und Fehlermeldung koexistieren (aria-Verknüpfung intakt)", async ({ page }) => {
  test.skip(!(await portalActive(page)), "Kein Portal-Deployment");
  await openVorhaben(page);
  // Testdaten laden und NUR die Kurzbeschreibung leeren → der einzige Fehler
  // liegt im Vorhaben-Tab (Submit-Fokus bleibt hier, Tab wechselt nicht).
  await page.getByRole("button", { name: "Testdaten laden" }).click();
  await page.getByRole("tab", { name: /Vorhaben/ }).click();
  const feld = page.locator('[id="vorhaben.beschreibung"]');
  await feld.fill("");
  // Erklärung am Pflichtfeld öffnen, dann Submit mit Fehler.
  const trigger = page.getByRole("button", { name: /Erklärung zu: Kurzbeschreibung des Vorhabens/ });
  await trigger.click();
  await expect(page.getByText(/Was ist das Ziel\?/)).toBeVisible();
  await page.getByRole("button", { name: "PDF herunterladen" }).click();
  // Beide sichtbar und unterscheidbar; PROJ-17-Fehlerverknüpfung bleibt intakt.
  await expect(feld).toHaveAttribute("aria-invalid", "true");
  const describedBy = await feld.getAttribute("aria-describedby");
  expect(describedBy).toContain("vorhaben.beschreibung-error");
  await expect(page.locator('[id="vorhaben.beschreibung-error"]')).toBeVisible();
  await expect(page.getByText(/Was ist das Ziel\?/)).toBeVisible();
});

test("FlexCover-Regression: keinerlei Erklärungs-Auslöser (Status quo)", async ({ page }) => {
  const resp = await page.goto("/antrag/flexcover");
  test.skip(resp?.status() !== 200, "FlexCover in diesem Deployment nicht aktiv (Portal-Modus)");
  await expect(page.locator('[id="Ansprechpartner.email"]')).toBeVisible();
  await expect(page.getByRole("button", { name: new RegExp(TRIGGER) })).toHaveCount(0);
});
