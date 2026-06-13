import { defineConfig, devices } from '@playwright/test';

// Smoke tests run against the static site served exactly as GitHub Pages would
// serve it: a plain HTTP server over the repo root (native ES modules need HTTP,
// not file://).
export default defineConfig({
  testDir: './test/smoke',
  testMatch: '**/*.spec.mjs',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'python3 -m http.server 8000',
    url: 'http://127.0.0.1:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
