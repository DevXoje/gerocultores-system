import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const assetsDir = path.resolve(__dirname, '../../../OUTPUTS/academic/assets');

test.describe('Academic Screenshots Generator', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
  });

  test('Capture Login Screen (US-01)', async ({ page }) => {
    // Navigate to the app root (which should redirect to /login if not authenticated)
    await page.goto('/');
    
    // Wait for the login form to be visible
    await page.waitForSelector('form', { state: 'visible' });
    
    // Slight pause to ensure fonts/styles are fully loaded
    await page.waitForTimeout(500);
    
    // Take the screenshot
    const screenshotPath = path.join(assetsDir, 'login-screen.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    console.log(`Saved screenshot to ${screenshotPath}`);
    expect(fs.existsSync(screenshotPath)).toBeTruthy();
  });
});
