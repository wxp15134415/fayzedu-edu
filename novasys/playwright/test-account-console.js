const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // 存储控制台日志
  const consoleLogs = [];
  const networkResponses = [];
  
  // 监听控制台日志
  page.on('console', msg => {
    const log = {
      type: msg.type(),
      text: msg.text(),
      time: new Date().toISOString()
    };
    consoleLogs.push(log);
    console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`);
  });

  // 监听网络请求响应
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    
    if (url.includes('/user/userPage') || url.includes('/user/')) {
      const responseData = {
        url: url,
        status: status,
        time: new Date().toISOString()
      };
      
      try {
        const data = await response.json();
        responseData.body = data;
        networkResponses.push(responseData);
        console.log(`[NETWORK] ${url} - ${status}`);
        console.log(`[NETWORK BODY] ${JSON.stringify(data, null, 2)}`);
      } catch {
        const text = await response.text();
        responseData.body = text;
        networkResponses.push(responseData);
      }
    }
  });

  page.on('request', request => {
    const url = request.url();
    if (url.includes('/user/userPage') || url.includes('/user/')) {
      console.log(`[REQUEST] ${request.method()} ${url}`);
    }
  });

  const screenshotDir = '/Users/wangxiaoping/fayzedu/novasys/playwright';

  try {
    console.log('===== 开始访问登录页面 =====');
    await page.goto('http://localhost:9980');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotDir}/account-01-登录页面.png` });

    console.log('===== 正在登录 =====');
    await page.fill('input[placeholder="输入账号"]', 'super');
    await page.fill('input[placeholder="输入密码"]', '123456');
    await page.screenshot({ path: `${screenshotDir}/account-02-填写登录信息.png` });
    
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('登录')) {
        await btn.click();
        break;
      }
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${screenshotDir}/account-03-登录成功.png` });

    console.log('===== 访问账户设置页面 =====');
    await page.goto('http://localhost:9980/setting/account', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${screenshotDir}/account-04-账户页面.png` });

    console.log('===== 页面加载完成，等待网络请求 =====');
    await page.waitForTimeout(5000);

    // 输出汇总
    console.log('\n===== 控制台日志汇总 =====');
    console.log(JSON.stringify(consoleLogs, null, 2));

    console.log('\n===== 网络响应汇总 =====');
    console.log(JSON.stringify(networkResponses, null, 2));

  } catch (error) {
    console.error('测试过程中出错:', error);
    await page.screenshot({ path: `${screenshotDir}/account-error.png` });
  } finally {
    // 保存日志到文件
    const fs = require('fs');
    fs.writeFileSync(`${screenshotDir}/console-logs.json`, JSON.stringify(consoleLogs, null, 2));
    fs.writeFileSync(`${screenshotDir}/network-responses.json`, JSON.stringify(networkResponses, null, 2));
    console.log('\n===== 日志已保存到文件 =====');
    
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();
