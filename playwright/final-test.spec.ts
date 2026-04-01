import { test, expect } from '@playwright/test';

test.describe('Final Test User Edit', () => {
  test('Test User Edit - Modify Nickname to 最终测试成功', async ({ page }) => {
    let hasError = false;
    const errorMessages: string[] = [];
    let networkStatus = 0;
    
    page.on('request', request => {
      if (request.url().includes('/user/') && (request.method() === 'PATCH' || request.method() === 'PUT')) {
        console.log(`User update request: ${request.method()} ${request.url()}`);
        const postData = request.postData();
        console.log(`Request body: ${postData}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/user/')) {
        networkStatus = response.status();
        console.log(`User API response: ${response.status()} - ${response.url()}`);
        if (response.status() >= 400) {
          response.text().then(text => console.log(`Error response: ${text}`));
        }
      }
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`BROWSER ERROR: ${msg.text()}`);
      }
    });
    
    console.log('=== Final Test: User Edit Function ===');
    
    console.log('Step 1: Opening login page');
    await page.goto('http://localhost:9980/login', { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    console.log('Step 2: Logging in');
    await page.fill('input[placeholder="输入账号"]', 'super');
    await page.fill('input[placeholder="输入密码"]', '123456');
    await page.click('button:has-text("登录")');
    
    console.log('Step 3: Waiting for login...');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    console.log(`Logged in, URL: ${page.url()}`);
    
    console.log('Step 4: Navigate to account page');
    await page.goto('http://localhost:9980/setting/account', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('Step 5: Click first edit button');
    const editBtn = page.locator('button:has-text("编辑")').first();
    await editBtn.click();
    await page.waitForTimeout(1500);
    
    console.log('Step 6: Modify nickname to "最终测试成功"');
    const modalInputs = page.locator('.n-modal input');
    const inputCount = await modalInputs.count();
    console.log(`Found ${inputCount} inputs in modal`);
    
    if (inputCount > 0) {
      await modalInputs.nth(2).fill('最终测试成功');
      console.log('Filled new nickname: 最终测试成功');
    } else {
      hasError = true;
      errorMessages.push('No input fields found in modal');
    }
    
    console.log('Step 7: Click submit button');
    const submitBtn = page.locator('button:has-text("提交")').first();
    await submitBtn.click();
    await page.waitForTimeout(2000);
    
    console.log('Step 8: Check result');
    console.log(`Network response status: ${networkStatus}`);
    
    const successToast = page.locator('.n-message--success, .ant-message-success').first();
    const errorToast = page.locator('.n-message--error, .ant-message-error').first();
    
    const isSuccessVisible = await successToast.isVisible().catch(() => false);
    const isErrorVisible = await errorToast.isVisible().catch(() => false);
    
    console.log(`Success toast visible: ${isSuccessVisible}`);
    console.log(`Error toast visible: ${isErrorVisible}`);
    
    if (networkStatus === 200) {
      console.log('✓ Save successful - HTTP 200');
    } else if (isSuccessVisible) {
      console.log('✓ Save successful - Success toast shown');
    } else if (isErrorVisible) {
      const errorText = await errorToast.textContent().catch(() => 'Unknown');
      hasError = true;
      errorMessages.push(`Error toast: ${errorText}`);
    } else {
      hasError = true;
      errorMessages.push(`Network status: ${networkStatus}`);
    }
    
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/final-test-result.png' });
    console.log('Screenshot saved');
    
    console.log('\n=== TEST RESULT ===');
    console.log(`Status: ${hasError ? 'FAILED' : 'PASSED'}`);
    console.log(`Network HTTP Status: ${networkStatus}`);
    console.log(`Errors: ${errorMessages.join('; ')}`);
    
    expect(hasError).toBe(false);
  });
});
