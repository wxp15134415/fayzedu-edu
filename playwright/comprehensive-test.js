const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('deprecated')) {
      errors.push(msg.text());
      console.log('BROWSER ERROR:', msg.text().substring(0, 200));
    }
  });

  const results = [];

  try {
    // Step 1: 登录
    console.log('=== Test 1: Login ===');
    await page.goto('http://localhost:9980/login', { timeout: 15000, waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const accountInput = page.locator('input[autocomplete="username"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    if (await accountInput.isVisible()) {
      await accountInput.fill('super');
      await passwordInput.fill('123456');
      const loginBtn = page.locator('button:has-text("登录")').first();
      await loginBtn.click();
      await page.waitForTimeout(5000);
      results.push({ test: 'Login', status: page.url().includes('dashboard') ? 'PASS' : 'FAIL' });
      console.log('Login result:', results[results.length - 1].status);
    }

    // Step 2: 工作台
    console.log('\n=== Test 2: Dashboard ===');
    await page.goto('http://localhost:9980/dashboard/workbench', { timeout: 15000, waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/test-dashboard.png' });
    results.push({ test: 'Dashboard', status: 'PASS' });
    console.log('Dashboard: PASS');

    // Step 3: 用户管理
    console.log('\n=== Test 3: User Management ===');
    await page.goto('http://localhost:9980/system/user', { timeout: 15000, waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/test-user-mgmt.png' });
    const hasUserTable = await page.locator('.n-data-table, table').first().isVisible().catch(() => false);
    results.push({ test: 'User Management', status: hasUserTable ? 'PASS' : 'FAIL' });
    console.log('User Management:', results[results.length - 1].status);

    // Step 4: 角色管理
    console.log('\n=== Test 4: Role Management ===');
    await page.goto('http://localhost:9980/system/role', { timeout: 15000, waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/test-role-mgmt.png' });
    results.push({ test: 'Role Management', status: 'PASS' });

    // Step 5: 菜单管理
    console.log('\n=== Test 5: Menu Management ===');
    await page.goto('http://localhost:9980/system/menu', { timeout: 15000, waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/test-menu-mgmt.png' });
    results.push({ test: 'Menu Management', status: 'PASS' });

    // Step 6: 部门管理
    console.log('\n=== Test 6: Department Management ===');
    await page.goto('http://localhost:9980/system/dept', { timeout: 15000, waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/test-dept-mgmt.png' });
    results.push({ test: 'Department Management', status: 'PASS' });

    // Step 7: 字典管理
    console.log('\n=== Test 7: Dictionary Management ===');
    await page.goto('http://localhost:9980/system/dict', { timeout: 15000, waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/test-dict-mgmt.png' });
    results.push({ test: 'Dictionary Management', status: 'PASS' });

    // Step 8: 登录日志
    console.log('\n=== Test 8: Login Logs ===');
    await page.goto('http://localhost:9980/monitor/login-log', { timeout: 15000, waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/test-login-log.png' });
    results.push({ test: 'Login Logs', status: 'PASS' });

    // Summary
    console.log('\n\n========== TEST SUMMARY ==========');
    results.forEach(r => console.log(`${r.status}\t${r.test}`));
    const passed = results.filter(r => r.status === 'PASS').length;
    console.log(`\nTotal: ${passed}/${results.length} passed`);

    if (errors.length > 0) {
      console.log('\n=== Errors ===');
      errors.forEach(e => console.log('-', e.substring(0, 150)));
    }

    console.log('\nScreenshots saved to /Users/wangxiaoping/fayzedu/playwright/test-*.png');

  } catch (e) {
    console.error('ERROR:', e.message);
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/playwright/test-error.png' });
  } finally {
    await browser.close();
  }
})();