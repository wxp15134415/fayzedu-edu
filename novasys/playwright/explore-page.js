const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    console.log('访问登录页面...');
    await page.goto('http://localhost:9980');
    await page.waitForLoadState('networkidle');

    console.log('正在登录...');
    await page.fill('input[placeholder="输入账号"]', 'super');
    await page.fill('input[placeholder="输入密码"]', '123456');

    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('登录')) {
        await btn.click();
        break;
      }
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('\n========== 探索用户管理页面 ==========');
    await page.goto('http://localhost:9980/system/user', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    const userPageHTML = await page.content();
    console.log('页面包含的元素:');
    console.log(userPageHTML.substring(0, 5000));

    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/explore-user.png' });

    console.log('\n页面上的所有按钮:');
    const allButtons = await page.$$('button');
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent();
      const className = await allButtons[i].getAttribute('class');
      console.log(`按钮 ${i}: "${text}" class: ${className}`);
    }

    console.log('\n页面上的所有链接/导航:');
    const links = await page.$$('a');
    for (let i = 0; i < links.length; i++) {
      const href = await links[i].getAttribute('href');
      const text = await links[i].textContent();
      console.log(`链接 ${i}: "${text}" href: ${href}`);
    }

    console.log('\n等待 30 秒让你观察页面...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('出错:', error);
  } finally {
    await browser.close();
  }
})();
