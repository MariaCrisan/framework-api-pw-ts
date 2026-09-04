import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { bddConfig } from './playwright-bdd.config';

const testDir = defineBddConfig(bddConfig);

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    trace: 'retain-on-failure',
  },
});
