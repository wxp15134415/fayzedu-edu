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

    const info = await page.evaluate(() => {
      const result = {};
      
      const tree = document.querySelector('.n-tree, [class*="tree"]');
      result.tree = tree ? tree.className : '未找到';
      
      const dataTable = document.querySelector('.n-data-table');
      result.dataTable = dataTable ? dataTable.className : '未找到';
      
      const treeNodes = document.querySelectorAll('.n-tree-node, [class*="tree-node"]');
      result.treeNodes = treeNodes.length;
      
      const tableRows = document.querySelectorAll('tbody tr');
      result.tableRows = tableRows.length;
      
      const expandBtns = document.querySelectorAll('[class*="expand"], [class*="arrow"]');
      result.expandBtns = expandBtns.length;
      
      return result;
    });
    console.log('页面元素信息:', JSON.stringify(info, null, 2));

    console.log('\n=== 所有可点击元素 ===');
    const allElements = await page.$$('button, [role="treeitem"], [class*="node"]');
    console.log(`共 ${allElements.length} 个元素`);
    
    for (let i = 0; i < Math.min(allElements.length, 20); i++) {
      try {
        const text = (await allElements[i].textContent()).trim().substring(0, 50);
        const className = await allElements[i].getAttribute('class');
        if (text) console.log(`[${i}] "${text}" - ${className?.substring(0, 30)}`);
      } catch(e) {}
    }

  } finally {
    await browser.close();
  }
}

main();
