const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:9980';
const USERNAME = 'super';
const PASSWORD = '123456';

async function main() {
  console.log('启动调试模式...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder="输入账号"]', USERNAME);
    await page.fill('input[placeholder="输入密码"]', PASSWORD);

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

    console.log('=== 访问用户管理页面 ===');
    await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('\n=== 所有按钮元素 ===');
    const allButtons = await page.$$('button');
    console.log(`共找到 ${allButtons.length} 个按钮`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent();
      const classAttr = await allButtons[i].getAttribute('class');
      console.log(`[${i}] "${text}" - class: ${classAttr}`);
    }

    console.log('\n=== 表格行中的按钮 ===');
    const tableButtons = await page.$$('table button, tbody button, tr button');
    console.log(`共找到 ${tableButtons.length} 个表格内按钮`);
    
    for (let i = 0; i < tableButtons.length; i++) {
      const text = await tableButtons[i].textContent();
      console.log(`表格按钮 [${i}]: "${text.trim()}"`);
    }

    console.log('\n=== 页面HTML片段 (表格区域) ===');
    const tableHTML = await page.evaluate(() => {
      const table = document.querySelector('table');
      return table ? table.outerHTML.substring(0, 2000) : '未找到表格';
    });
    console.log(tableHTML);

    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('错误:', error);
  } finally {
    await browser.close();
  }
}

main();
