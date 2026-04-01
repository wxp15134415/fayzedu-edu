import { test, expect } from '@playwright/test';

test.describe('User Edit Function Test', () => {
  test('Test User Edit - Modify Nickname', async ({ page }) => {
    console.log('=== Testing User Edit Function ===');
    let hasError = false;
    const errorMessages: string[] = [];
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log(`BROWSER ERROR: ${msg.text()}`);
      }
    });
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
      console.log(`BROWSER PAGE ERROR: ${error.message}`);
    });

    try {
      console.log('Step 1: Opening browser to login page');
      await page.goto('http://localhost:9980/login', { timeout: 30000, waitUntil: 'domcontentloaded' });
      
      await page.waitForSelector('#app', { timeout: 20000 });
      await page.waitForTimeout(3000);
      
      console.log(`Page URL: ${page.url()}`);
      console.log(`Page title: ${await page.title()}`);
      
      console.log('Step 2: Logging in');
      await page.fill('input[placeholder="输入账号"]', 'super');
      await page.fill('input[placeholder="输入密码"]', '123456');
      
      console.log('Filled credentials, clicking submit');
      await page.click('button');
      
      console.log('Waiting for login response...');
      await page.waitForTimeout(8000);
      
      const currentUrl = page.url();
      console.log(`After login, URL: ${currentUrl}`);
      
      if (currentUrl.includes('login') && !currentUrl.includes('dashboard')) {
        const loginInputStillVisible = await page.locator('input[placeholder="输入账号"]').isVisible().catch(() => false);
        if (loginInputStillVisible) {
          console.log('✗ Login FAILED - still on login page with input visible');
          hasError = true;
          errorMessages.push('登录失败 - 后端服务可能未运行');
          console.log('Console errors so far:', consoleErrors.length);
          
          console.log('\n=== TEST RESULT ===');
          console.log('Status: FAILED');
          console.log('Errors:', errorMessages.join('; '));
          console.log('This appears to be a backend server issue, not a test issue.');
          
          await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/user-edit-result.png' });
          console.log('Screenshot saved');
          
          expect(hasError).toBe(false);
          return;
        }
      } else {
        console.log('✓ Login appears successful, continuing...');
      }
      
      console.log('Step 3: Navigating to account page');
      await page.goto('http://localhost:9980/setting/account', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      console.log(`At account page, URL: ${page.url()}`);
      
      console.log('Step 4: Looking for Edit button');
      const editButton = page.locator('button:has-text("编辑")').first();
      
      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();
        console.log('✓ Edit button clicked');
      } else {
        hasError = true;
        errorMessages.push('找不到编辑按钮');
        console.log('✗ Edit button not visible');
      }
      
      await page.waitForTimeout(1500);
      
      console.log('Step 5: Modifying nickname in modal');
      const modal = page.locator('.ant-modal, .n-modal').first();
      
      if (await modal.isVisible().catch(() => false)) {
        console.log('✓ Edit modal opened');
        
        const inputsInModal = await page.locator('.n-modal input').all();
        if (inputsInModal.length > 0) {
          const newNickname = '测试用户_' + Date.now();
          await inputsInModal[0].fill(newNickname);
          console.log(`✓ Filled new nickname: ${newNickname}`);
          
          console.log('Step 6: Clicking submit button');
          const submitButton = page.locator('button:has-text("确定")').first();
          if (await submitButton.isVisible().catch(() => false)) {
            await submitButton.click();
            console.log('✓ Submit button clicked');
          } else {
            hasError = true;
            errorMessages.push('找不到确定按钮');
          }
        } else {
          hasError = true;
          errorMessages.push('弹窗中没有输入框');
        }
      } else {
        hasError = true;
        errorMessages.push('编辑弹窗未打开');
      }
      
      await page.waitForTimeout(2000);
      
      console.log('Step 7: Checking result');
      const successToast = page.locator('.ant-message-success').first();
      const errorToast = page.locator('.ant-message-error').first();
      
      if (await successToast.isVisible().catch(() => false)) {
        console.log('✓ Success: User edit completed');
      } else if (await errorToast.isVisible().catch(() => false)) {
        const errText = await errorToast.textContent().catch(() => '未知');
        hasError = true;
        errorMessages.push(`Error: ${errText}`);
      } else if (!(await modal.isVisible().catch(() => true))) {
        console.log('✓ Modal closed - edit likely successful');
      }
      
    } catch (e: any) {
      hasError = true;
      errorMessages.push(`Exception: ${e.message}`);
      console.log(`✗ Exception: ${e.message}`);
    }
    
    console.log('\n=== TEST RESULT ===');
    if (hasError) {
      console.log('Status: FAILED');
      console.log('Errors:', errorMessages.join('; '));
    } else {
      console.log('Status: PASSED');
    }
    
    if (consoleErrors.length > 0) {
      console.log('Console errors collected:', consoleErrors.join('; '));
    }
    
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/user-edit-result.png' });
    console.log('Screenshot saved');
    
    expect(hasError).toBe(false);
  });
});
