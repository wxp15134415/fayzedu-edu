import { chromium, Browser, Page } from 'playwright';

async function testDeptPage() {
  let browser: Browser | null = null;
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
    
    // 监听控制台消息
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('Console Error:', msg.text());
      }
    });
    
    // 监听页面错误
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
      console.log('Page Error:', err.message);
    });

    // 1. 访问登录页面
    console.log('访问前端地址...');
    await page.goto('http://localhost:9980/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 2. 登录
    console.log('执行登录...');
    await page.fill('input[type="text"], input[placeholder*="账"], input[placeholder*="用户名"]', 'super');
    await page.fill('input[type="password"], input[placeholder*="密"]', '123456');
    await page.click('button[type="submit"], button:has-text("登"), button:has-text("登录")');
    
    await page.waitForTimeout(3000);
    
    // 截图登录后页面
    await page.screenshot({ path: `${screenshotsDir}/dept-after-login-${timestamp}.png`, fullPage: true });
    console.log('登录后截图已保存');
    
    // 3. 访问部门管理页面
    console.log('访问部门管理页面...');
    await page.goto('http://localhost:9980/#/setting/dept', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 截图部门管理页面
    await page.screenshot({ path: `${screenshotsDir}/departmentmanagement-${timestamp}.png`, fullPage: true });
    console.log('部门管理页面截图已保存');
    
    // 检查页面标题和内容
    const pageTitle = await page.title();
    console.log('页面标题:', pageTitle);
    
    // 检查是否有数据加载
    const hasTable = await page.$('table, .ant-table, .el-table');
    const hasData = await page.$('.ant-table-row, .el-table__row, tr[data-row-key]');
    
    console.log('是否有表格:', !!hasTable);
    console.log('是否有数据行:', !!hasData);
    
    // 检查是否有 404
    const pageContent = await page.content();
    const is404 = pageContent.includes('404') || pageContent.includes('Not Found') || pageContent.includes('页面不存在');
    console.log('是否404:', is404);
    
    // 输出控制台错误
    console.log('\n=== 控制台错误 ===');
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(err => console.log(err));
    } else {
      console.log('无控制台错误');
    }
    
    console.log('\n=== 测试结果 ===');
    console.log('页面访问成功');
    console.log('表格存在:', !!hasTable);
    console.log('数据加载:', !!hasData);
    console.log('控制台错误数:', consoleErrors.length);
    
    return {
      success: true,
      hasTable: !!hasTable,
      hasData: !!hasData,
      is404: is404,
      consoleErrors
    };
    
  } catch (error: any) {
    console.error('测试失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (browser) {
      console.log('\n保持浏览器打开，按回车键关闭...');
      await new Promise<void>(resolve => {
        process.stdin.once('data', () => {
          browser?.close();
          resolve();
        });
      });
    }
  }
}

testDeptPage();
