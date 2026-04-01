const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:9980';

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.fill('input[placeholder="输入账号"]', 'super');
    await page.fill('input[placeholder="输入密码"]', '123456');
    
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      if ((await btn.textContent()).includes('登录')) {
        await btn.click();
        break;
      }
    }
    await page.waitForTimeout(3000);

    console.log('\n=== 菜单页面结构 ===');
    await page.goto(BASE_URL + '/setting/menu', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const html = await page.evaluate(() => {
      return document.body.innerHTML.substring(0, 5000);
    });
    console.log(html);

  } finally {
    await browser.close();
  }
}

main();
