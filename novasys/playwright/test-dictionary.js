const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  
  // Collect console messages
  const consoleMessages = [];
  const consoleErrors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });
  
  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });
  
  // Collect network failures
  const networkErrors = [];
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure()
    });
  });
  
  try {
    console.log('=== 开始测试字典管理页面 ===\n');
    
    // Step 1: Navigate to frontend
    console.log('1. 打开前端页面...');
    await page.goto('http://localhost:9980/', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('   前端页面已加载\n');
    
    // Step 2: Login
    console.log('2. 执行登录...');
    await page.fill('input[type="text"]', 'super');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('   登录成功\n');
    
    // Step 3: Navigate to dictionary page
    console.log('3. 访问字典管理页面...');
    const startTime = Date.now();
    await page.goto('http://localhost:9980/setting/dictionary', { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = Date.now() - startTime;
    console.log(`   页面加载耗时: ${loadTime}ms\n`);
    
    // Wait a bit for any async data loading
    await page.waitForTimeout(2000);
    
    // Step 4: Check page content
    console.log('4. 检查页面内容...');
    
    // Check for 404
    const bodyText = await page.textContent('body');
    const has404 = bodyText.includes('404') || bodyText.includes('Not Found');
    console.log(`   页面404: ${has404 ? '是' : '否'}`);
    
    // Check page title
    const title = await page.title();
    console.log(`   页面标题: ${title}`);
    
    // Take screenshot
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dictionary-page.png', fullPage: true });
    console.log('   截图已保存: dictionary-page.png\n');
    
    // Step 5: Check for API calls and data
    console.log('5. 检查API调用...');
    const apiCalls = networkErrors.filter(e => e.url.includes('/api/'));
    if (apiCalls.length > 0) {
      console.log('   API错误:');
      apiCalls.forEach(api => {
        console.log(`     - ${api.url}: ${api.failure?.errorText || 'Failed'}`);
      });
    } else {
      console.log('   API调用: 正常');
    }
    console.log('');
    
    // Step 6: Report console errors
    console.log('6. 控制台错误:');
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(err => console.log(`   - ${err}`));
    } else {
      console.log('   无控制台错误');
    }
    console.log('');
    
    // Step 7: Report page errors
    console.log('7. 页面JavaScript错误:');
    if (pageErrors.length > 0) {
      pageErrors.forEach(err => console.log(`   - ${err}`));
    } else {
      console.log('   无JavaScript错误');
    }
    console.log('');
    
    // Summary
    console.log('=== 测试结果汇总 ===');
    console.log(`页面加载: ${has404 ? '失败 (404)' : '成功'}`);
    console.log(`加载耗时: ${loadTime}ms`);
    console.log(`控制台错误数: ${consoleErrors.length}`);
    console.log(`页面JS错误数: ${pageErrors.length}`);
    console.log(`API错误数: ${apiCalls.length}`);
    console.log('');
    
    // Check if there's any data displayed
    const tableExists = await page.$('table') !== null;
    console.log(`数据表格: ${tableExists ? '存在' : '不存在'}`);
    
    if (tableExists) {
      const rows = await page.$$('table tbody tr');
      console.log(`数据行数: ${rows.length}`);
    }
    
    console.log('\n测试完成！');
    
  } catch (error) {
    console.error('测试失败:', error.message);
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dictionary-error.png', fullPage: true });
  } finally {
    // Keep browser open for inspection
    // await browser.close();
  }
})();
