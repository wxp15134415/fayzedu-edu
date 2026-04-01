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

    const pages = [
      '/setting/account',
      '/setting/role', 
      '/setting/menu'
    ];

    for (const p of pages) {
      console.log(`\n=== 检查 ${p} ===`);
      await page.goto(BASE_URL + p, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      const rowCount = await page.evaluate(() => {
        const tbody = document.querySelector('tbody');
        if (!tbody) return 0;
        return tbody.querySelectorAll('tr').length;
      });
      console.log(`表格行数: ${rowCount}`);

      const allButtons = await page.$$('button');
      console.log(`按钮数量: ${allButtons.length}`);
      for (const btn of allButtons) {
        const text = (await btn.textContent()).trim();
        if (text) console.log(`  - "${text}"`);
      }
    }

  } finally {
    await browser.close();
  }
}

main();
