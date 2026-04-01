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
    
    console.log('获取页面内容...');
    const html = await page.content();
    console.log('页面标题:', await page.title());
    
    const inputs = await page.$$('input');
    console.log(`找到 ${inputs.length} 个 input 元素`);
    
    for (let i = 0; i < inputs.length; i++) {
      const placeholder = await inputs[i].getAttribute('placeholder');
      const name = await inputs[i].getAttribute('name');
      const id = await inputs[i].getAttribute('id');
      console.log(`Input ${i}: placeholder=${placeholder}, name=${name}, id=${id}`);
    }

    await page.waitForTimeout(5000);
    await browser.close();
  } catch (error) {
    console.error('出错:', error);
    await browser.close();
  }
})();
