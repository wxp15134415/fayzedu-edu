import { chromium, Browser, Page, Request, Response } from 'playwright';

async function test() {
  console.log('🚀 启动浏览器...');
  const browser: Browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page: Page = await context.newPage();
  
  // 收集控制台错误
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });
  
  // 收集网络请求和响应
  const networkLogs: { url: string; status: number; ok: boolean; response?: any }[] = [];
  page.on('response', async (response: Response) => {
    const url = response.url();
    const status = response.status();
    const ok = response.ok();
    
    // 记录 /user/userPage 请求
    if (url.includes('/user/userPage')) {
      console.log(`📡 Network: ${url} - Status: ${status}`);
      
      let responseBody: any;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = await response.text();
      }
      
      networkLogs.push({ url, status, ok, response: responseBody });
      
      // 打印响应内容
      if (responseBody) {
        console.log(`   响应内容: ${JSON.stringify(responseBody).substring(0, 500)}`);
      }
    }
  });
  
  // 收集网络错误
  const networkErrors: string[] = [];
  page.on('pageerror', error => {
    networkErrors.push(error.message);
    console.log(`❌ Page Error: ${error.message}`);
  });

  try {
    // 1. 访问登录页
    console.log('📍 访问登录页...');
    await page.goto('http://localhost:9980/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // 2. 登录
    console.log('🔐 尝试登录...');
    const loginButton = page.locator('button').filter({ hasText: /登录|登录/i }).first();
    
    if (await loginButton.isVisible()) {
      // 输入用户名和密码
      await page.fill('input[type="text"], input[placeholder*="账"], input[placeholder*="用户"]', 'super');
      await page.fill('input[type="password"], input[placeholder*="密"], input[placeholder*="密码"]', '123456');
      await loginButton.click();
      
      console.log('⏳ 等待登录跳转...');
      await page.waitForURL(url => !url.toString().includes('login'), { timeout: 15000 });
      console.log('✅ 登录成功');
    } else {
      console.log('ℹ️ 似乎已经登录了');
    }
    
    await page.waitForTimeout(2000);
    
    // 3. 访问用户管理页面 /account
    console.log('📍 访问用户管理页面 /account...');
    await page.goto('http://localhost:9980/setting/account', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // 4. 截图
    console.log('📸 截图保存...');
    await page.screenshot({ 
      path: '/Users/wangxiaoping/fayzedu/novasys/playwright/account-page.png',
      fullPage: true 
    });
    
    // 5. 检查页面内容
    console.log('🔍 检查页面内容...');
    const pageContent = await page.content();
    const pageTitle = await page.title();
    
    // 检查是否有 404
    const is404 = pageContent.includes('404') || pageContent.includes('Not Found') || pageContent.includes('页面不存在');
    if (is404) {
      console.log('⚠️ 页面返回 404');
    }
    
    // 检查是否有数据表格
    const hasTable = pageContent.includes('table') || pageContent.includes('表格') || pageContent.includes('用户');
    console.log(`📊 页面包含表格元素: ${hasTable}`);
    
    // 6. 输出结果
    console.log('\n========== 测试结果 ==========');
    console.log(`页面标题: ${pageTitle}`);
    console.log(`控制台错误数量: ${consoleErrors.length}`);
    console.log(`网络错误数量: ${networkErrors.length}`);
    console.log(`/user/userPage 请求数量: ${networkLogs.length}`);
    
    if (networkLogs.length > 0) {
      console.log('\n/user/userPage 响应详情:');
      networkLogs.forEach((log, i) => {
        console.log(`  ${i+1}. URL: ${log.url}`);
        console.log(`     Status: ${log.status} (${log.ok ? 'OK' : 'FAILED'})`);
      });
    }
    
    if (consoleErrors.length > 0) {
      console.log('\n控制台错误详情:');
      consoleErrors.forEach((err, i) => {
        console.log(`  ${i+1}. ${err}`);
      });
    }
    
    if (networkErrors.length > 0) {
      console.log('\n网络错误详情:');
      networkErrors.forEach((err, i) => {
        console.log(`  ${i+1}. ${err}`);
      });
    }
    
    console.log('\n✅ 测试完成');
    console.log('📁 截图保存于: /Users/wangxiaoping/fayzedu/novasys/playwright/account-page.png');
    
  } catch (error: any) {
    console.error('❌ 测试失败:', error.message);
    
    // 失败时也截图
    await page.screenshot({ 
      path: '/Users/wangxiaoping/fayzedu/novasys/playwright/account-page-error.png',
      fullPage: true 
    });
  } finally {
    // 保持浏览器打开以便查看
    console.log('\n按回车键关闭浏览器...');
    await new Promise(resolve => process.stdin.once('data', resolve));
    await browser.close();
  }
}

test();
