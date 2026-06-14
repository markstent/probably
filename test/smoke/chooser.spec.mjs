import { test, expect } from '@playwright/test';

test('find-by-data chooser filters the gallery to matching distributions', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'counts of events' }).click();
  await expect(page.locator('.gcard[data-id="poisson"]')).toBeVisible();
  await expect(page.locator('.gcard[data-id="negative-binomial"]')).toBeVisible();
  await expect(page.locator('.gcard[data-id="beta"]')).toBeHidden();
  // clicking the active option again clears the filter
  await page.getByRole('button', { name: 'counts of events' }).click();
  await expect(page.locator('.gcard[data-id="beta"]')).toBeVisible();
});
