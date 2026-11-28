import { defineConfig, devices } from '@playwright/test';

const edge = process.env.MDS_EDGE_PATH;
export default defineConfig({
  testDir: './tests/browser',
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: edge ? { executablePath: edge } : {} } },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
  ],
});
