const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  const context = await browser.newContext();
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

    console.log('等待登录后页面加载...');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${screenshotDir}/03-登录成功.png` });
    
    console.log('查找菜单元素...');
    const menuItems = await page.$$('.ant-menu-item, .ant-menu-submenu-title, .ant-layout-sider-children a');
    console.log(`找到 ${menuItems.length} 个菜单项`);
    
    for (let i = 0; i < Math.min(menuItems.length, 20); i++) {
      try {
        const text = await menuItems[i].textContent();
        console.log(`菜单 ${i}: ${text.trim()}`);
      } catch(e) {
        console.log(`菜单 ${i}: 无法获取文本`);
      }
    }

    await page.waitForTimeout(3000);
    await browser.close();
  } catch (error) {
    console.error('出错:', error);
    await page.screenshot({ path: `${screenshotDir}/error.png` });
    await browser.close();
  }
})();
