import { chromium, Browser, Page } from 'playwright';

async function testMobileAccountPage() {
  let browser: Browser | null = null;
  const screenshotsDir = '/Users/wangxiaoping/fayzedu/novasys/playwright/screenshots';
  const timestamp = Date.now();
  
  try {
    console.log('启动浏览器...');
    browser = await chromium.launch({ 
      headless: true 
    });
    
    // 1. 设置手机尺寸视窗 (375x667 - iPhone SE size)
    console.log('设置手机视窗尺寸: 375x667');
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      deviceScaleFactor: 2,  // 模拟Retina屏幕
      isMobile: true,
      hasTouch: true
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

    // 2. 访问账户设置页面
    console.log('访问账户设置页面...');
    await page.goto('http://localhost:9980/setting/account', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 截图初始页面（登录页）
    await page.screenshot({ path: `${screenshotsDir}/mobile-account-before-login-${timestamp}.png` });
    console.log('登录前截图已保存');
    
    // 3. 登录
    console.log('执行登录...');
    await page.fill('input[type="text"], input[placeholder*="账"], input[placeholder*="用户名"]', 'super');
    await page.fill('input[type="password"], input[placeholder*="密"]', '123456');
    await page.click('button[type="submit"], button:has-text("登"), button:has-text("登录")');
    
    await page.waitForTimeout(3000);
    
    // 截图登录后页面
    await page.screenshot({ path: `${screenshotsDir}/mobile-account-after-login-${timestamp}.png` });
    console.log('登录后截图已保存');
    
    // 检查页面内容
    const pageContent = await page.content();
    const is404 = pageContent.includes('404') || pageContent.includes('Not Found') || pageContent.includes('页面不存在');
    
    // 4. 检查卡片式显示 vs 表格
    // 查找表格元素
    const hasTable = await page.$('table, .ant-table, .el-table, .n-data-table');
    // 查找卡片元素
    const hasCards = await page.$('.ant-card, .el-card, .n-card, .card, [class*="card"]');
    // 查找列表项
    const hasListItems = await page.$('.ant-list-item, .el-list-item, .n-list-item, li[class*="item"]');
    // 查找表单元素
    const hasForm = await page.$('form, .ant-form, .el-form');
    
    console.log('\n=== 布局检查 ===');
    console.log('是否有表格:', !!hasTable);
    console.log('是否有卡片:', !!hasCards);
    console.log('是否有列表项:', !!hasListItems);
    console.log('是否有表单:', !!hasForm);
    console.log('是否404:', is404);
    
    // 检查主要容器结构
    const mainContainer = await page.$('.ant-layout, .el-layout, main, #app');
    console.log('是否有主容器:', !!mainContainer);
    
    // 输出控制台错误
    console.log('\n=== 控制台错误 ===');
    if (consoleErrors.length > 0) {
      for (const err of consoleErrors) {
        console.log(err);
      }
    } else {
      console.log('无控制台错误');
    }
    
    // 判断是否正常
    const isNormal = !is404 && consoleErrors.length === 0;
    // 判断是否为卡片式显示
    const isCardLayout = hasCards || hasListItems;
    const isTableLayout = hasTable && !hasCards;
    
    console.log('\n=== 测试结果 ===');
    console.log('手机页面显示正常:', isNormal);
    console.log('卡片式显示:', isCardLayout);
    console.log('表格显示:', isTableLayout);
    console.log('控制台错误数:', consoleErrors.length);
    
    return {
      success: isNormal,
      isCardLayout: isCardLayout,
      isTableLayout: isTableLayout,
      hasTable: !!hasTable,
      hasCards: !!hasCards,
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
      await browser.close();
    }
  }
}

testMobileAccountPage();