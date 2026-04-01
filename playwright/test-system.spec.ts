import { test, expect } from '@playwright/test';

test.describe('Fayzedu System E2E Test', () => {
  test('Complete System Test - Login to User Management', async ({ page }) => {
    const errors: string[] = [];
    
    // 捕获控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`BROWSER ERROR: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log(`PAGE ERROR: ${error.message}`);
    });

    try {
      // Step 1: 访问登录页面
      console.log('Step 1: Opening login page...');
      await page.goto('http://localhost:9980/login', { timeout: 30000, waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      // 截图
      await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/test-01-login.png' });
      console.log('Screenshot: test-01-login.png');
      
      // Step 2: 登录
      console.log('Step 2: Logging in...');
      await page.fill('input[placeholder="输入账号"]', 'super');
      await page.fill('input[placeholder="输入密码"]', '123456');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(5000);
      
      // 截图
      await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/test-02-after-login.png' });
      console.log('Screenshot: test-02-after-login.png');
      
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('login')) {
        console.log('Still on login page - checking for errors...');
        const pageContent = await page.content();
        console.log('Page contains error:', pageContent.includes('error') || pageContent.includes('失败'));
      }
      
      // Step 3: 访问用户管理页面
      console.log('Step 3: Navigating to user management...');
      await page.goto('http://localhost:9980/system/user', { timeout: 30000, waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      // 截图
      await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/test-03-user-management.png' });
      console.log('Screenshot: test-03-user-management.png');
      
      // 检查是否有用户列表
      const hasUserList = await page.locator('table, .n-data-table').first().isVisible().catch(() => false);
      console.log('User list visible:', hasUserList);
      
      // Step 4: 检查控制台错误
      console.log('\\n=== Console Errors ===');
      if (errors.length > 0) {
        errors.forEach(e => console.log(' -', e.substring(0, 200)));
      } else {
        console.log('No console errors');
      }
      
      console.log('\\n=== TEST RESULT ===');
      console.log('Test completed - screenshots saved');
      
    } catch (e: any) {
      console.log('\\n=== TEST ERROR ===');
      console.log(e.message);
      await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/test-error.png' });
    }
  });
});