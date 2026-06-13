import { test, expect } from '@playwright/test';

test('Dirichlet renders the 2-simplex with chalk density dots', async ({ page }) => {
  await page.goto('/#dirichlet');
  await expect(page.locator('.dist-name')).toContainText('Dirichlet');
  await expect(page.locator('svg .simplex-dot').first()).toBeVisible();
  const count = await page.locator('svg .simplex-dot').count();
  expect(count).toBeGreaterThan(100);
});
