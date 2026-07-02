import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// PROJ-18 — Neutrales Formular-Portal. Diese Tests setzen ein Deployment im
// PORTAL-Modus voraus (NEXT_PUBLIC_BRAND=eforms, NEXT_PUBLIC_ACTIVE_FORMS=musterantrag).
// Im Default-Modus (FlexCover) ist /antrag/musterantrag 404 → Tests überspringen
// sich selbst. So bleiben sie in der Standard-CI grün und laufen gezielt gegen das Portal.

async function portalActive(page: Page): Promise<boolean> {
  const resp = await page.goto("/antrag/musterantrag");
  return resp?.status() === 200;
}

test("Portal: Startseite trägt die neutrale Marke (eforms)", async ({ page }) => {
  test.skip(!(await portalActive(page)), "Kein Portal-Deployment");
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Barrierefreie und DSGVO-konforme Formulare/);
});

test("Portal: FlexCover ist nicht erreichbar (404-gated)", async ({ page }) => {
  test.skip(!(await portalActive(page)), "Kein Portal-Deployment");
  const resp = await page.goto("/antrag/flexcover");
  expect(resp?.status()).toBe(404);
});

test("Portal: Einreichungsliste erfordert Anmeldung (Auth-Guard)", async ({ page }) => {
  test.skip(!(await portalActive(page)), "Kein Portal-Deployment");
  await page.goto("/antrag/musterantrag/eingereicht");
  await expect(page).toHaveURL(/\/login/);
  await expect(page).toHaveURL(/returnTo=.*musterantrag/);
});

test("Portal: Muster-Förderantrag ausfüllen → PDF herunterladen (anonym, clientseitig)", async ({ page }) => {
  test.skip(!(await portalActive(page)), "Kein Portal-Deployment");
  await page.goto("/antrag/musterantrag");

  // Formular ist geladen, sobald die Testdaten-Schaltfläche (Dev) erscheint.
  const loadSample = page.getByRole("button", { name: "Testdaten laden" });
  await expect(loadSample).toBeVisible();
  await loadSample.click();

  // Anonyme Primäraktion ist „PDF herunterladen" → muss einen Download auslösen.
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "PDF herunterladen" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^musterantrag-.*\.pdf$/);
});

test("Portal: Muster-Antragsseite hat keine kritischen/schweren axe-Verstöße", async ({ page }, testInfo) => {
  test.skip(!(await portalActive(page)), "Kein Portal-Deployment");
  test.skip(testInfo.project.name === "Mobile Safari", "axe-Kernprüfung auf Desktop");
  await page.goto("/antrag/musterantrag");
  await expect(page.getByRole("button", { name: "Testdaten laden" })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const blocking = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  expect(blocking, blocking.map((v) => `${v.id} (${v.impact}): ${v.help}`).join("\n")).toEqual([]);
});
