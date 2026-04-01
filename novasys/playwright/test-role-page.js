const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 收集控制台消息
  const consoleMessages = [];
  const consoleErrors = [];
  const consoleWarnings = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(text);
    }
    console.log(`[${msg.type()}] ${text}`);
  });
  
  // 收集页面错误
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log(`[PAGE ERROR] ${error.message}`);
  });
  
  // 收集网络请求
  const networkErrors = [];
  const apiResponses = [];
  
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    
    if (url.includes('/api/') || url.includes('/setting/')) {
      apiResponses.push({ url, status, statusText: response.statusText() });
    }
    
    if (status >= 400) {
      networkErrors.push({ url, status, statusText: response.statusText() });
      console.log(`[NETWORK ERROR] ${status} ${response.statusText()} - ${url}`);
    }
  });
  
  try {
    console.log('=== 开始测试角色管理页面 ===\n');
    
    // 1. 访问前端
    console.log('1. 访问前端页面: http://localhost:9980/');
    await page.goto('http://localhost:9980/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('   首页加载完成\n');
    
    // 2. 登录
    console.log('2. 执行登录操作...');
    await page.fill('input[type="text"], input[placeholder*="账"], input[placeholder*="用户"]', 'super');
    await page.fill('input[type="password"], input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"], button:has-text("登 录"), button:has-text("登录")');
    
    // 等待登录完成
    await page.waitForTimeout(3000);
    console.log('   登录完成\n');
    
    // 截图：登录后
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/screenshots/role-page-01-after-login.png' });
    console.log('   截图已保存: role-page-01-after-login.png\n');
    
    // 3. 访问角色管理页面
    console.log('3. 访问角色管理页面: http://localhost:9980/setting/role');
    await page.goto('http://localhost:9980/setting/role', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // 截图：角色管理页面
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/screenshots/role-page-02-role-page.png' });
    console.log('   截图已保存: role-page-02-role-page.png\n');
    
    // 4. 检查页面内容
    console.log('4. 检查页面内容...');
    const pageTitle = await page.title();
    console.log(`   页面标题: ${pageTitle}`);
    
    const pageUrl = page.url();
    console.log(`   当前URL: ${pageUrl}`);
    
    // 检查是否有404相关内容
    const pageContent = await page.content();
    const has404 = pageContent.includes('404') || pageContent.includes('Not Found') || pageContent.includes('页面不存在');
    console.log(`   是否包含404: ${has404}`);
    
    // 检查是否有数据表格
    const hasTable = await page.locator('table, .ant-table, .el-table').count();
    console.log(`   表格元素数量: ${hasTable}`);
    
    // 检查是否有角色相关数据
    const roleText = await page.locator('text=角色').first().isVisible().catch(() => false);
    console.log(`   是否显示"角色"文字: ${roleText}`);
    
    // 等待数据加载
    await page.waitForTimeout(2000);
    
    // 再次截图
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/screenshots/role-page-03-after-data.png' });
    console.log('   截图已保存: role-page-03-after-data.png\n');
    
    // 5. 输出汇总报告
    console.log('=== 测试结果汇总 ===\n');
    
    console.log('【页面状态】');
    console.log(`  - 页面URL: ${pageUrl}`);
    console.log(`  - 是否为404: ${has404 ? '是 ❌' : '否 ✅'}`);
    console.log(`  - 是否有表格: ${hasTable > 0 ? '是 ✅' : '否 ❌'}`);
    
    console.log('\n【控制台错误】');
    if (consoleErrors.length > 0) {
      console.log(`  ❌ 发现 ${consoleErrors.length} 个控制台错误:`);
      consoleErrors.forEach((err, i) => console.log(`    ${i+1}. ${err.substring(0, 200)}`));
    } else {
      console.log('  ✅ 无控制台错误');
    }
    
    console.log('\n【页面错误】');
    if (pageErrors.length > 0) {
      console.log(`  ❌ 发现 ${pageErrors.length} 个页面错误:`);
      pageErrors.forEach((err, i) => console.log(`    ${i+1}. ${err.substring(0, 200)}`));
    } else {
      console.log('  ✅ 无页面错误');
    }
    
    console.log('\n【网络/API错误】');
    if (networkErrors.length > 0) {
      console.log(`  ❌ 发现 ${networkErrors.length} 个网络错误:`);
      networkErrors.forEach((err, i) => console.log(`    ${i+1}. ${err.status} ${err.statusText} - ${err.url.substring(0, 80)}`));
    } else {
      console.log('  ✅ 无网络错误');
    }
    
    console.log('\n【API响应状态】');
    apiResponses.forEach(api => {
      const icon = api.status >= 400 ? '❌' : '✅';
      console.log(`  ${icon} ${api.status} ${api.statusText} - ${api.url.substring(0, 60)}...`);
    });
    
    console.log('\n【控制台警告】');
    if (consoleWarnings.length > 0) {
      console.log(`  ⚠️  发现 ${consoleWarnings.length} 个警告:`);
      consoleWarnings.slice(0, 5).forEach((w, i) => console.log(`    ${i+1}. ${w.substring(0, 100)}`));
    } else {
      console.log('  ✅ 无警告');
    }
    
    console.log('\n=== 测试完成 ===');
    
    // 保存测试日志
    const fs = require('fs');
    const logPath = '/Users/wangxiaoping/fayzedu/novasys/playwright/role-page-test-log.txt';
    const logContent = `
=== 角色管理页面测试日志 ===
时间: ${new Date().toISOString()}

【页面状态】
  URL: ${pageUrl}
  是否为404: ${has404 ? '是' : '否'}
  是否有表格: ${hasTable > 0 ? '是' : '否'}

【控制台错误】
  数量: ${consoleErrors.length}
  ${consoleErrors.map((e, i) => `${i+1}. ${e}`).join('\n  ')}

【页面错误】
  数量: ${pageErrors.length}
  ${pageErrors.map((e, i) => `${i+1}. ${e}`).join('\n  ')}

【网络错误】
  数量: ${networkErrors.length}
  ${networkErrors.map(e => `${e.status} ${e.statusText} - ${e.url}`).join('\n  ')}

【API响应】
  ${apiResponses.map(a => `${a.status} ${a.statusText} - ${a.url}`).join('\n  ')}
`;
    fs.writeFileSync(logPath, logContent);
    console.log(`\n日志已保存: ${logPath}`);
    
  } catch (error) {
    console.error('测试过程出错:', error.message);
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/screenshots/role-page-error.png' });
  } finally {
    // 保持浏览器打开，让用户查看
    console.log('\n浏览器保持打开状态，按 Ctrl+C 结束...');
  }
})();
