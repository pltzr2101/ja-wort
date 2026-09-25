import { expect, test } from "@playwright/test";

/**
 * Optionaler Smoke-Test. Voraussetzung: ein laufender Server unter BASE_URL
 * (Standard http://localhost:3000) mit gesetzten Passwoertern.
 *
 *   npx playwright test
 */
test("ohne Anmeldung landet man auf der Gate-Seite", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/gate/);
  await expect(page.getByRole("heading", { name: "JaWort" })).toBeVisible();
});
