const { chromium } = require('playwright');

async function testDoubleClickEdit() {
  let browser = null;
  const screenshotsDir = '/Users/wangxiaoping/fayzedu/novasys/playwright/screenshots';
  const timestamp = Date.now();
  
  try {
    console.log('启动浏览器...');
    browser = await chromium.launch({ 
      headless: false,
      args: ['--start-maximized']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('Console Error:', msg.text());
      }
    });
    
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
      console.log('Page Error:', err.message);
    });

    console.log('访问账号设置页面...');
    await page.goto('http://localhost:9980/setting/account', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: `${screenshotsDir}/account-initial-${timestamp}.png`, fullPage: true });
    console.log('初始页面截图已保存');
    
    const pageContent = await page.content();
    const needsLogin = pageContent.includes('登录') && !pageContent.includes('账号设置');
    
    if (needsLogin) {
      console.log('需要登录，执行登录...');
      await page.fill('input[type="text"], input[placeholder*="账"], input[placeholder*="用户名"]', 'super');
      await page.fill('input[type="password"], input[placeholder*="密"]', '123456');
      await page.click('button[type="submit"], button:has-text("登"), button:has-text("登录")');
      
      await page.waitForTimeout(3000);
      
      console.log('登录后访问账号设置页面...');
      await page.goto('http://localhost:9980/setting/account', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: `${screenshotsDir}/account-after-login-${timestamp}.png`, fullPage: true });
    console.log('登录后页面截图已保存');
    
    console.log('查找联系方式单元格...');
    
    const tableHtml = await page.$('table, .ant-table, .el-table, .elx-table');
    
    if (!tableHtml) {
      console.log('未找到表格，尝试查找页面内容...');
      const content = await page.content();
      console.log('页面内容片段:', content.substring(0, 2000));
      
      return { success: false, error: '未找到表格' };
    }
    
    const contactCell = await page.locator('td, th', { hasText: '联系方式' }).first();
    const contactCellCount = await contactCell.count();
    
    console.log('找到联系方式相关单元格数量:', contactCellCount);
    
    if (contactCellCount > 0) {
      console.log('双击联系方式单元格...');
      await contactCell.dblclick();
      await page.waitForTimeout(500);
      
      await page.screenshot({ path: `${screenshotsDir}/account-edit-mode-${timestamp}.png`, fullPage: true });
      console.log('编辑模式截图已保存');
      
      const editInput = await page.$('.n-input input, .n-input, input.n-input__input-el, .ant-input, .el-input__inner');
      const isEditMode = !!editInput;
      
      console.log('是否进入编辑模式:', isEditMode);
      
      if (isEditMode) {
        console.log('修改联系方式值...');
        
        const inputEl = await page.$('.n-input input, .n-input textarea, .n-input .n-input__input-el');
        if (inputEl) {
          await inputEl.click();
          await page.keyboard.press('Control+a');
          await page.keyboard.press('Backspace');
          await inputEl.type('13800138000');
          await page.waitForTimeout(300);
          
          await page.screenshot({ path: `${screenshotsDir}/account-after-edit-${timestamp}.png`, fullPage: true });
          
          console.log('按回车保存...');
          await page.keyboard.press('Enter');
          await page.waitForTimeout(1000);
          
          await page.screenshot({ path: `${screenshotsDir}/account-after-save-${timestamp}.png`, fullPage: true });
          
          const newContent = await page.content();
          const saved = newContent.includes('13800138000');
          
          console.log('保存成功:', saved);
          
          return { success: saved, editMode: true, saved, consoleErrors };
        }
      }
      
      console.log('尝试其他方式查找编辑控件...');
      const anyInput = await page.$('input');
      if (anyInput) {
        console.log('找到输入框，尝试双击...');
        await anyInput.dblclick();
        await page.waitForTimeout(500);
        
        const editInputAfter = await page.$('.n-input input:focus, .n-input:focus, input.n-input__input-el:focus, input:focus, input.ant-input, .el-input__inner');
        if (editInputAfter) {
          await editInputAfter.fill('13900139000');
          await page.keyboard.press('Enter');
          await page.waitForTimeout(1000);
          
          const newContent = await page.content();
          const saved = newContent.includes('13900139000');
          
          return { success: saved, editMode: true, saved, consoleErrors };
        }
      }
      
      return { success: false, editMode: false, error: '未能进入编辑模式', consoleErrors };
    } else {
      console.log('未找到联系方式，列出所有表格单元格...');
      const allCells = await page.$$('td');
      
      for (let i = 0; i < Math.min(allCells.length, 20); i++) {
        const text = await allCells[i].textContent();
        console.log(`单元格 ${i}:`, text?.trim());
      }
      
      return { success: false, error: '未找到联系方式单元格', consoleErrors };
    }
    
  } catch (error) {
    console.error('测试失败:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      console.log('\n测试完成，关闭浏览器...');
      setTimeout(() => {
        browser.close();
      }, 3000);
    }
  }
}

testDoubleClickEdit();
