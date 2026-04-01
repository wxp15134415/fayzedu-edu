import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('字典类型页面测试', () => {
  test('测试字典设置页面', async ({ page }) => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];

    // 监听控制台错误和警告
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
      if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    // 监听页面错误
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });

    console.log('1. 打开浏览器并访问前端...');
    await page.goto('http://localhost:9980/', { waitUntil: 'networkidle' });

    console.log('2. 登录...');
    // 输入用户名
    await page.fill('input[placeholder="请输入账号"]', 'super');
    // 输入密码
    await page.fill('input[type="password"]', '123456');
    // 点击登录按钮
    await page.click('button[type="submit"]');

    // 等待登录成功，跳转到工作台
    await page.waitForURL('**/dashboard/workbench', { timeout: 10000 });
    console.log('3. 登录成功，页面跳转到了工作台');

    console.log('4. 导航到字典设置页面 /setting/dictionary');
    await page.goto('http://localhost:9980/setting/dictionary', { waitUntil: 'networkidle' });

    // 等待页面加载
    await page.waitForTimeout(2000);

    // 截图
    const screenshotPath = path.join('/Users/wangxiaoping/fayzedu/playwright', 'dict-setting-page.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`5. 截图已保存: ${screenshotPath}`);

    // 检查页面标题
    const pageTitle = await page.title();
    console.log(`6. 页面标题: ${pageTitle}`);

    // 检查是否有内容
    const bodyText = await page.textContent('body');
    const hasContent = bodyText && bodyText.length > 100;
    console.log(`7. 页面是否有内容: ${hasContent}`);

    // 检查是否有404
    const has404 = bodyText?.includes('404') || bodyText?.includes('Not Found');
    console.log(`8. 是否404: ${has404}`);

    // 打印控制台错误
    if (consoleErrors.length > 0) {
      console.log('\n=== 控制台错误 ===');
      consoleErrors.forEach(err => {
        console.log(`ERROR: ${err}`);
      });
    }

    if (consoleWarnings.length > 0) {
      console.log('\n=== 控制台警告 ===');
      consoleWarnings.forEach(warn => {
        console.log(`WARN: ${warn}`);
      });
    }

    // 测试字典示例页面
    console.log('\n========================================');
    console.log('测试字典示例页面 /demo/dict');
    console.log('========================================\n');

    await page.goto('http://localhost:9980/demo/dict', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const demoScreenshotPath = path.join('/Users/wangxiaoping/fayzedu/playwright', 'dict-demo-page.png');
    await page.screenshot({ path: demoScreenshotPath, fullPage: true });
    console.log(`截图已保存: ${demoScreenshotPath}`);

    const demoBodyText = await page.textContent('body');
    const demoHas404 = demoBodyText?.includes('404') || demoBodyText?.includes('Not Found');
    console.log(`是否404: ${demoHas404}`);

    // 总结
    console.log('\n========================================');
    console.log('测试结果汇总');
    console.log('========================================');
    console.log(`字典设置页面 (/setting/dictionary):`);
    console.log(`  - 页面存在: ${!has404}`);
    console.log(`  - 控制台错误数: ${consoleErrors.length}`);
    console.log(`  - 控制台警告数: ${consoleWarnings.length}`);
    console.log(`\n字典示例页面 (/demo/dict):`);
    console.log(`  - 页面存在: ${!demoHas404}`);
  });
});
