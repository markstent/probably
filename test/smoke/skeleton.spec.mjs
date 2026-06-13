import { test, expect } from '@playwright/test';

// Integration smoke for the walking skeleton. Verifies the wiring (render,
// hash routing, live redraw), not pixels.

test('home screen renders the title and a family grid with Beta', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.logo')).toContainText('Probably');
  // Family grid shows the built distribution as a chalk chip.
  await expect(page.getByRole('button', { name: 'Beta' }).first()).toBeVisible();
});

test('clicking the Beta chip routes via hash and renders the board', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Beta' }).first().click();
  await expect(page).toHaveURL(/#beta$/);
  await expect(page.locator('.dist-name')).toContainText('Beta');
  await expect(page.locator('.notation')).toContainText('Beta(α, β)');
  // Curve and stats are present.
  await expect(page.locator('svg .curve-path')).toBeVisible();
  await expect(page.locator('.stats')).toContainText('Mean');
});

test('deep-link to #beta renders the board directly on load', async ({ page }) => {
  await page.goto('/#beta');
  await expect(page.locator('.dist-name')).toContainText('Beta');
});

test('moving a parameter slider redraws the curve', async ({ page }) => {
  await page.goto('/#beta');
  const path = page.locator('svg .curve-path');
  const before = await path.getAttribute('d');
  const slider = page.locator('input[type="range"]').first();
  await slider.focus();
  // Several arrow presses move the shape parameter and must redraw the path.
  for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
  await expect(async () => {
    const after = await path.getAttribute('d');
    expect(after).not.toBe(before);
  }).toPass();
});

test('Escape returns to the home screen from a distribution', async ({ page }) => {
  await page.goto('/#beta');
  await expect(page.locator('.dist-name')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/(#)?$/);
  await expect(page.locator('.home')).toBeVisible();
});
