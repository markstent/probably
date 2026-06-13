import { test, expect } from '@playwright/test';

test('a discrete distribution renders as a chalk bar chart', async ({ page }) => {
  await page.goto('/#bernoulli');
  await expect(page.locator('.dist-name')).toContainText('Bernoulli');
  await expect(page.locator('svg .bar').first()).toBeVisible();
  // two bars for {0, 1}
  await expect(page.locator('svg .bar')).toHaveCount(2);
});
