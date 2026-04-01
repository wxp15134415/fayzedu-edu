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
    apiCalls: [],
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
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        report.consoleErrors.push(msg.text());
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    page.on('pageerror', err => {
      report.consoleErrors.push(err.message);
      console.log('❌ Page Error:', err.message);
    });

    page.on('response', async response => {
      const url = response.url();
      const status = response.status();
      const isBackend = url.includes('localhost:3000') || url.includes('127.0.0.1:3000');
      
      if (isBackend) {
        const apiInfo = { url, status };
        report.apiCalls.push(apiInfo);
        
        if (status >= 400) {
          const errorMsg = `API Error: ${url} - Status ${status}`;
          report.apiErrors.push(errorMsg);
          console.log('❌', errorMsg);
          
          try {
            const body = await response.text();
            console.log('   Response:', body.substring(0, 300));
          } catch (e) {}
        } else {
          console.log('✅ 后端API: ', url, status);
        }
      }
    });
    
    console.log('📍 访问前端地址...');
    await page.goto('http://localhost:9980/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('🔐 执行登录...');
    await page.fill('input[type="text"], input[placeholder*="账"], input[placeholder*="用户名"]', 'super');
    await page.fill('input[type="password"], input[placeholder*="密"]', '123456');
    await page.click('button[type="submit"], button:has-text("登"), button:has-text("登录")');
    
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: `${screenshotsDir}/dept-after-login-${timestamp}.png`, fullPage: true });
    console.log('📸 登录后截图已保存');
    
    console.log('📍 尝试通过URL直接访问部门管理...');
    await page.goto('http://localhost:9980/#/setting/dept', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('📍 当前URL:', currentUrl);
    
    let pageText = await page.textContent('body');
    console.log('📊 页面是否包含部门:', pageText.includes('部门'));
    
    if (!pageText.includes('部门管理')) {
      console.log('🔄 尝试通过侧边栏点击进入...');
      
      const menuItems = await page.$$('.n-menu-item, .menu-item, [class*="menu"]');
      console.log(`📊 找到 ${menuItems.length} 个菜单项`);
      
      for (const item of menuItems) {
        const text = await item.textContent();
        if (text && text.includes('部门')) {
          console.log('📍 点击部门菜单项...');
          await item.click();
          await page.waitForTimeout(3000);
          break;
        }
      }
    }
    
    await page.screenshot({ path: `${screenshotsDir}/departmentmanagement-${timestamp}.png`, fullPage: true });
    console.log('📸 部门管理页面截图已保存');
    
    const pageTitle = await page.title();
    console.log('📝 页面标题:', pageTitle);
    
    const hasTable = await page.$('table, .ant-table, .el-table, .n-data-table');
    const hasData = await page.$('.ant-table-row, .el-table__row, tr[data-row-key], .n-data-table-tr');
    const hasEmpty = await page.$('.n-empty, .ant-empty, .empty');
    
    report.tableExists = !!hasTable;
    report.dataLoaded = !!hasData;
    
    const finalPageText = await page.textContent('body');
    console.log('📊 部门标题存在:', finalPageText.includes('部门'));
    console.log('📊 表格存在:', report.tableExists);
    console.log('📊 数据行存在:', report.dataLoaded);
    console.log('📊 空状态存在:', !!hasEmpty);
    
    const pageContent = await page.content();
    const is404 = pageContent.includes('404') || pageContent.includes('Not Found') || pageContent.includes('页面不存在') || pageContent.includes('找不到页面');
    report.has404 = is404;
    
    console.log('\n页面文本内容预览:', finalPageText.substring(0, 500));
    
    if (report.apiErrors.length === 0) {
      report.backendApiStatus = 'OK (无错误)';
    } else {
      report.backendApiStatus = 'Error - ' + report.apiErrors.join('; ');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 测试结果汇总');
    console.log('='.repeat(50));
    console.log('✅ 页面状态:', report.pageStatus || '200 OK');
    console.log('🚫 404错误:', report.has404 ? '是' : '否');
    console.log('📊 表格存在:', report.tableExists ? '是' : '否');
    console.log('📊 数据加载:', report.dataLoaded ? '是' : '否');
    console.log('🌐 后端API调用次数:', report.apiCalls.length);
    console.log('🌐 后端API状态:', report.backendApiStatus);
    console.log('❌ 控制台错误数:', report.consoleErrors.length);
    
    if (report.apiCalls.length > 0) {
      console.log('\n后端API调用详情:');
      report.apiCalls.forEach((call, i) => {
        console.log(`  ${i+1}. ${call.url} - ${call.status}`);
      });
    }
    
    if (report.consoleErrors.length > 0) {
      console.log('\n控制台错误详情:');
      report.consoleErrors.forEach((err, i) => {
        console.log(`  ${i+1}. ${err}`);
      });
    }
    
    console.log('\n📸 截图位置:');
    console.log(`  - 登录后: ${screenshotsDir}/dept-after-login-${timestamp}.png`);
    console.log(`  - 部门管理: ${screenshotsDir}/departmentmanagement-${timestamp}.png`);
    
    console.log('\n✅ 测试完成！浏览器保持打开，按 Ctrl+C 关闭');
    
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    report.error = error.message;
  }
}

testDeptPage();
