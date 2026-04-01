const { chromium } = require('playwright');

async function testDeptPage() {
  let browser = null;
  const screenshotsDir = '/Users/wangxiaoping/fayzedu/novasys/playwright/screenshots';
  const timestamp = Date.now();
  const report = {
    pageStatus: '',
    has404: false,
    consoleErrors: [],
    apiErrors: [],
    backendApiStatus: 'unknown',
    tableExists: false,
    dataLoaded: false
  };

  try {
    console.log('🚀 启动浏览器...');
    browser = await chromium.launch({ 
      headless: false,
      args: ['--start-maximized']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // 监听控制台消息
    page.on('console', msg => {
      if (msg.type() === 'error') {
        report.consoleErrors.push(msg.text());
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    // 监听页面错误
    page.on('pageerror', err => {
      report.consoleErrors.push(err.message);
      console.log('❌ Page Error:', err.message);
    });

    // 监听网络请求，捕获 API 响应
    page.on('response', async response => {
      const url = response.url();
      const status = response.status();
      
      // 检查是否是后端 API 请求
      if (url.includes('localhost:3000') || url.includes('api')) {
        if (status >= 400) {
          const errorMsg = `API Error: ${url} - Status ${status}`;
          report.apiErrors.push(errorMsg);
          console.log('❌', errorMsg);
          
          try {
            const body = await response.text();
            console.log('   Response:', body.substring(0, 200));
          } catch (e) {}
        } else if (status >= 200 && status < 300) {
          console.log('✅ API OK:', url, status);
        }
      }
    });
    
    // 1. 访问登录页面
    console.log('📍 访问前端地址...');
    await page.goto('http://localhost:9980/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 2. 登录
    console.log('🔐 执行登录...');
    await page.fill('input[type="text"], input[placeholder*="账"], input[placeholder*="用户名"]', 'super');
    await page.fill('input[type="password"], input[placeholder*="密"]', '123456');
    await page.click('button[type="submit"], button:has-text("登"), button:has-text("登录")');
    
    await page.waitForTimeout(3000);
    
    // 截图登录后页面
    await page.screenshot({ path: `${screenshotsDir}/dept-after-login-${timestamp}.png`, fullPage: true });
    console.log('📸 登录后截图已保存');
    
    // 3. 访问部门管理页面
    console.log('📍 访问部门管理页面 /setting/dept...');
    const deptResponse = await page.goto('http://localhost:9980/#/setting/dept', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 检查 HTTP 状态
    if (deptResponse) {
      report.pageStatus = deptResponse.status() + ' ' + deptResponse.statusText();
    }
    console.log('📄 页面状态:', report.pageStatus);
    
    // 截图部门管理页面
    await page.screenshot({ path: `${screenshotsDir}/departmentmanagement-${timestamp}.png`, fullPage: true });
    console.log('📸 部门管理页面截图已保存');
    
    // 检查页面标题和内容
    const pageTitle = await page.title();
    console.log('📝 页面标题:', pageTitle);
    
    // 检查是否有数据加载
    const hasTable = await page.$('table, .ant-table, .el-table, .n-data-table, .n-layout');
    const hasData = await page.$('.ant-table-row, .el-table__row, tr[data-row-key], .n-data-table-tr');
    
    report.tableExists = !!hasTable;
    report.dataLoaded = !!hasData;
    
    console.log('📊 是否有表格:', report.tableExists);
    console.log('📊 是否有数据行:', report.dataLoaded);
    
    // 检查是否有 404
    const pageContent = await page.content();
    const is404 = pageContent.includes('404') || pageContent.includes('Not Found') || pageContent.includes('页面不存在') || pageContent.includes('找不到页面');
    report.has404 = is404;
    console.log('🚫 是否404:', report.has404);
    
    // 尝试查找更多关于数据的线索
    const pageText = await page.textContent('body');
    if (pageText) {
      if (pageText.includes('暂无数据') || pageText.includes('没有数据')) {
        console.log('📊 页面显示: 暂无数据');
      }
      if (pageText.includes('部门') || pageText.includes('Department')) {
        console.log('✅ 页面包含部门相关内容');
      }
    }
    
    // 确定后端 API 状态
    if (report.apiErrors.length === 0) {
      report.backendApiStatus = 'OK (无错误)';
    } else {
      report.backendApiStatus = 'Error - ' + report.apiErrors.join('; ');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 测试结果汇总');
    console.log('='.repeat(50));
    console.log('✅ 页面状态:', report.pageStatus || '正常访问');
    console.log('🚫 404错误:', report.has404 ? '是' : '否');
    console.log('📊 表格存在:', report.tableExists ? '是' : '否');
    console.log('📊 数据加载:', report.dataLoaded ? '是' : '否');
    console.log('🌐 后端API状态:', report.backendApiStatus);
    console.log('❌ 控制台错误数:', report.consoleErrors.length);
    
    if (report.consoleErrors.length > 0) {
      console.log('\n控制台错误详情:');
      report.consoleErrors.forEach((err, i) => {
        console.log(`  ${i+1}. ${err}`);
      });
    }
    
    if (report.apiErrors.length > 0) {
      console.log('\n后端API错误详情:');
      report.apiErrors.forEach((err, i) => {
        console.log(`  ${i+1}. ${err}`);
      });
    }
    
    console.log('\n📸 截图位置:');
    console.log(`  - 登录后: ${screenshotsDir}/dept-after-login-${timestamp}.png`);
    console.log(`  - 部门管理: ${screenshotsDir}/departmentmanagement-${timestamp}.png`);
    
    console.log('\n✅ 测试完成！浏览器保持打开，按 Ctrl+C 关闭');
    
    // 保持浏览器打开
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    report.error = error.message;
  } finally {
    if (browser) {
      // 不自动关闭，等待用户
    }
  }
}

testDeptPage();
