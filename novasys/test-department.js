const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = {
    consoleErrors: [],
    networkErrors: [],
    apiErrors: [],
    pageStatus: null,
    has404: false,
    departmentData: null
  };

  // 监听控制台错误
  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.consoleErrors.push(msg.text());
      console.log('[Console Error]:', msg.text());
    }
  });

  // 监听网络请求失败
  page.on('requestfailed', request => {
    const failure = request.failure();
    if (failure) {
      results.networkErrors.push({
        url: request.url(),
        error: failure.errorText
      });
      console.log('[Network Error]:', request.url(), '-', failure.errorText);
    }
  });

  try {
    console.log('=== 开始测试部门管理页面 ===\n');

    // 1. 访问登录页
    console.log('1. 访问前端页面...');
    await page.goto('http://localhost:9980/', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('   前端页面加载完成\n');

    // 2. 登录
    console.log('2. 执行登录...');
    await page.fill('input[type="text"], input[placeholder*="账"], input[name="username"]', 'super');
    await page.fill('input[type="password"], input[placeholder*="密"], input[name="password"]', '123456');
    await page.click('button[type="submit"], button:has-text("登录"), button:has-text("登 录")');
    
    // 等待登录成功跳转
    await page.waitForTimeout(3000);
    console.log('   登录完成\n');

    // 3. 访问部门管理页面
    console.log('3. 访问部门管理页面 /setting/department...');
    const response = await page.goto('http://localhost:9980/setting/department', { 
      waitUntil: 'networkidle', 
      timeout: 30000 
    });
    
    if (response) {
      results.pageStatus = response.status();
      console.log('   页面状态码:', results.pageStatus);
      
      if (response.status() === 404) {
        results.has404 = true;
        console.log('   ⚠️ 页面返回 404\n');
      }
    }

    // 等待页面渲染
    await page.waitForTimeout(2000);

    // 4. 检查是否有内容
    const pageContent = await page.content();
    console.log('   页面内容长度:', pageContent.length, '字符');

    // 5. 截图
    const screenshotPath = '/Users/wangxiaoping/fayzedu/novasys/playwright/department-page.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('   📸 截图已保存:', screenshotPath, '\n');

    // 6. 检查 API 请求
    console.log('4. 检查 API 调用...');
    const apiRequests = [];
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/') || url.includes('/department')) {
        const status = response.status();
        const body = await response.text().catch(() => '');
        apiRequests.push({ url, status, body: body.substring(0, 500) });
        
        if (status >= 400) {
          results.apiErrors.push({ url, status, body: body.substring(0, 500) });
        }
      }
    });

    // 再次访问触发 API
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    if (apiRequests.length > 0) {
      console.log('   发现 API 请求:');
      apiRequests.forEach(req => {
        console.log(`   - ${req.url}: ${req.status}`);
        if (req.status >= 400) {
          console.log(`     错误内容: ${req.body}`);
        }
      });
    } else {
      console.log('   未发现 API 请求');
    }

    // 7. 检查页面元素
    console.log('\n5. 检查页面元素...');
    const title = await page.title();
    console.log('   页面标题:', title);

    // 尝试查找表格或列表
    const tableExists = await page.locator('table, .ant-table, .el-table, [class*="table"]').count() > 0;
    const listExists = await page.locator('ul, ol, [class*="list"]').count() > 0;
    console.log('   表格元素:', tableExists ? '存在' : '不存在');
    console.log('   列表元素:', listExists ? '存在' : '不存在');

    // 尝试查找错误提示
    const errorMsg = await page.locator('.error, [class*="error"], .ant-message-error').first().textContent().catch(() => '');
    if (errorMsg) {
      console.log('   错误提示:', errorMsg);
    }

    // 输出最终结果
    console.log('\n=== 测试结果汇总 ===');
    console.log('页面状态:', results.pageStatus);
    console.log('是否404:', results.has404 ? '是' : '否');
    console.log('控制台错误数:', results.consoleErrors.length);
    if (results.consoleErrors.length > 0) {
      console.log('控制台错误:');
      results.consoleErrors.forEach(err => console.log('  -', err));
    }
    console.log('网络错误数:', results.networkErrors.length);
    if (results.networkErrors.length > 0) {
      console.log('网络错误:');
      results.networkErrors.forEach(err => console.log('  -', err.url, err.error));
    }
    console.log('API 错误数:', results.apiErrors.length);
    if (results.apiErrors.length > 0) {
      console.log('API 错误:');
      results.apiErrors.forEach(err => console.log('  -', err.url, err.status, err.body));
    }

  } catch (error) {
    console.error('测试过程出错:', error.message);
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/error-screenshot.png' });
  } finally {
    console.log('\n按回车键关闭浏览器...');
    await page.waitForTimeout(1000);
    await browser.close();
  }
})();
