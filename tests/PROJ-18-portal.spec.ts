import { test, expect, type Page } from "@playwright/test";

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
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/jedem Gerät/);
});

test("Portal: FlexCover ist nicht erreichbar (404-gated)", async ({ page }) => {
  test.skip(!(await portalActive(page)), "Kein Portal-Deployment");
  const resp = await page.goto("/antrag/flexcover");
  expect(resp?.status()).toBe(404);
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
