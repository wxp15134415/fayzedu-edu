import { test, expect } from '@playwright/test';

test.describe('Debug User Edit', () => {
  test('Debug login and navigation', async ({ page }) => {
    const networkErrors: string[] = [];
    
    // Monitor network requests
    page.on('requestfailed', request => {
      console.log(`FAILED REQUEST: ${request.url()} - ${request.failure()?.errorText}`);
      networkErrors.push(`${request.url()} - ${request.failure()?.errorText}`);
    });
    
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`ERROR RESPONSE: ${response.url()} - ${response.status()}`);
        networkErrors.push(`${response.url()} - ${response.status()}`);
      }
    });
    
    page.on('console', msg => {
      console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
    });
    
    console.log('Step 1: Opening login page');
    await page.goto('http://localhost:9980/login', { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    console.log('Step 2: Filling credentials');
    await page.fill('input[placeholder="输入账号"]', 'super');
    await page.fill('input[placeholder="输入密码"]', '123456');
    await page.click('button:has-text("登录")');
    
    console.log('Step 3: Waiting for login...');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    console.log(`Logged in, URL: ${page.url()}`);
    
    console.log('Step 4: Navigate to account page');
    await page.goto('http://localhost:9980/setting/account', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('Step 5: Find edit button');
    const editBtn = page.locator('button:has-text("编辑")').first();
    
    const isVisible = await editBtn.isVisible().catch(() => false);
    console.log(`Edit button visible: ${isVisible}`);
    
    // Take screenshot
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/debug-screenshot.png' });
    console.log('Screenshot saved');
    
    console.log('\n=== Network Errors ===');
    networkErrors.forEach(e => console.log(e))
    
    expect(isVisible).toBe(true);
  });
});
