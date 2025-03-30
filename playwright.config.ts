// playwright.config.ts
import { devices } from '@playwright/test';

const dateNow: Date = new Date();
const htmlReportName = 'html_report_'  +
  dateNow.getDate() + '-' + dateNow.getMonth() + '-' + dateNow.getFullYear() + '_' +
  dateNow.getHours() + '-' + dateNow.getMinutes() + '-' + dateNow.getSeconds();

const config: devices = {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30 * 1000,
    navigationTimeout: 60 * 1000
  },
  expect: {
    timeout: 30 * 1000
  },
  timeout: 120 * 1000,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
  reporter: [
    ['line'],
//    ['html', { outputFolder: `reports/${htmlReportName}`, open: 'never' }],
    ['allure-playwright', {detail: true, outputFolder: `reports/allure_report`, open: 'never' }],
  ],
};

export default config;