const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const screenshotDir = '/Users/wangxiaoping/fayzedu/novasys/playwright';

  try {
    console.log('访问登录页面...');
    await page.goto('http://localhost:9980');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotDir}/01-登录页面.png` });

    console.log('正在登录...');
    await page.fill('input[placeholder="输入账号"]', 'super');
    await page.fill('input[placeholder="输入密码"]', '123456');
    await page.screenshot({ path: `${screenshotDir}/02-填写登录信息.png` });
    
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
    await page.screenshot({ path: `${screenshotDir}/03-登录成功.png` });

    console.log('测试用户管理页面...');
    await page.goto('http://localhost:9980/system/user', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotDir}/04-用户管理页面.png` });
    console.log('用户管理页面加载成功');

    console.log('测试角色管理页面...');
    await page.goto('http://localhost:9980/system/role', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotDir}/05-角色管理页面.png` });
    console.log('角色管理页面加载成功');

    console.log('测试菜单管理页面...');
    await page.goto('http://localhost:9980/system/menu', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotDir}/06-菜单管理页面.png` });
    console.log('菜单管理页面加载成功');

    console.log('所有测试完成！');

  } catch (error) {
    console.error('测试过程中出错:', error);
    await page.screenshot({ path: `${screenshotDir}/error.png` });
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
})();
