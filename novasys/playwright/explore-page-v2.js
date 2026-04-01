const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    console.log('访问登录页面...');
    await page.goto('http://localhost:9980');
    await page.waitForLoadState('networkidle');

    console.log('正在登录...');
    await page.fill('input[placeholder="输入账号"]', 'super');
    await page.fill('input[placeholder="输入密码"]', '123456');

    const loginButtons = await page.$$('button');
    for (const btn of loginButtons) {
      const text = await btn.textContent();
      if (text && text.includes('登录')) {
        await btn.click();
        break;
      }
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    console.log('\n========== 探索用户管理页面 ==========');
    await page.goto('http://localhost:9980/system/user', { waitUntil: 'networkidle', timeout: 30000 });
    
    await page.waitForTimeout(5000);

    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/explore-user.png' });

    console.log('查找包含"新增"或"添加"的元素...');
    const newButtons = await page.locator('button:has-text("新增"), button:has-text("添加"), button:has-text("新建"), .n-button:has-text("新增"), .n-button:has-text("添加")').all();
    console.log(`找到 ${newButtons.length} 个可能是新增按钮的元素`);

    console.log('\n页面上的所有按钮文本:');
    const allButtons = await page.$$('button');
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent({ timeout: 1000 }).catch(() => '');
      const ariaLabel = await allButtons[i].getAttribute('aria-label');
      console.log(`按钮 ${i}: "${text}" aria-label: ${ariaLabel}`);
    }

    console.log('\n查找所有带有图标按钮(可能是工具栏按钮)...');
    const iconButtons = await page.$$('.n-button, .el-button, button[type="button"]');
    for (let i = 0; i < iconButtons.length; i++) {
      const text = await iconButtons[i].textContent({ timeout: 1000 }).catch(() => '');
      const title = await iconButtons[i].getAttribute('title');
      console.log(`图标按钮 ${i}: text="${text}" title="${title}"`);
    }

    console.log('\n查找表格行...');
    const rows = await page.$$('tbody tr, .n-data-table tr, .el-table tr');
    console.log(`找到 ${rows.length} 行`);

    console.log('\n查找页面容器...');
    const mainContent = await page.$('.n-layout, .n-card, main, #app');
    if (mainContent) {
      const contentText = await mainContent.textContent();
      console.log('主内容区域文本:', contentText.substring(0, 500));
    }

    console.log('\n等待 60 秒让你观察页面...');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('出错:', error);
  } finally {
    await browser.close();
  }
})();
