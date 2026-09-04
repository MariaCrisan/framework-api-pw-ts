import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { config } from './src/config/config';

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'features/steps/**/*.ts',
  importTestFrom: { file: 'src/fixtures/api-fixtures.ts', varName: 'test' }
});

export default defineConfig({
  testDir,
  timeout: config.timeout,
  expect: { timeout: config.expectTimeout },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  use: {
    baseURL: config.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    ignoreHTTPSErrors: !config.verifySsl
  },
  outputDir: 'test-results/artifacts'
});
