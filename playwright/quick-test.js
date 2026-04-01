const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('BROWSER ERROR:', msg.text().substring(0, 150));
    }
  });

  try {
    console.log('Step 1: Opening login page...');
    await page.goto('http://localhost:9980/login', { timeout: 15000, waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/quick-01-login.png' });

    // 查找所有输入框
    const inputs = await page.locator('input').all();
    console.log('Found', inputs.length, 'inputs');

    // 尝试使用 n-input 类
    const nInputs = await page.locator('.n-input').all();
    console.log('Found', nInputs.length, 'n-input elements');

    // 直接使用输入框的占位符文本查找
    const accountInput = page.locator('input[placeholder*="账号"], input[placeholder*="账户"], input[autocomplete="username"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    console.log('accountInput visible:', await accountInput.isVisible().catch(() => false));
    console.log('passwordInput visible:', await passwordInput.isVisible().catch(() => false));

    if (await accountInput.isVisible()) {
      console.log('\nStep 2: Logging in...');
      await accountInput.fill('super');
      await passwordInput.fill('123456');

      // 找到登录按钮
      const loginBtn = page.locator('button:has-text("登录"), button:has-text("登入"), .n-button:has-text("登录")').first();
      console.log('loginBtn visible:', await loginBtn.isVisible().catch(() => false));

      if (await loginBtn.isVisible()) {
        await loginBtn.click();
        console.log('Clicked login button');
      } else {
        // 尝试点击任何主要的 n-button
        const buttons = await page.locator('.n-button').all();
        console.log('Found', buttons.length, 'n-buttons');
        if (buttons.length > 0) {
          await buttons[buttons.length - 1].click();
          console.log('Clicked last n-button');
        }
      }

      await page.waitForTimeout(6000);
      await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/quick-02-after-login.png' });
      console.log('URL after login:', page.url());
    } else {
      console.log('\nCould not find account input, trying direct form fill...');
      // 尝试直接执行 JavaScript 来设置值
      await page.evaluate(() => {
        const input = document.querySelector('input');
        if (input) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(input, 'super');
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    }

    console.log('\nStep 3: Navigating to user management...');
    await page.goto('http://localhost:9980/system/user', { timeout: 15000, waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/quick-03-user-mgmt.png' });
    console.log('URL:', page.url());

    console.log('\n=== Console Errors ===');
    errors.forEach(e => console.log('-', e.substring(0, 150)));
    if (errors.length === 0) console.log('No errors!');

    console.log('\n=== DONE ===');

  } catch (e) {
    console.error('ERROR:', e.message);
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/quick-error.png' });
  } finally {
    await browser.close();
  }
})();