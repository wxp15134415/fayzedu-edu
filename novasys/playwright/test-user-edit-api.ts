import { chromium, Browser, Page } from 'playwright';

async function testUserEdit() {
  let browser: Browser | null = null;
  const screenshotsDir = '/Users/wangxiaoping/fayzedu/novasys/playwright/screenshots';
  const timestamp = Date.now();
  
  const result = {
    success: false,
    errors: [] as string[],
    consoleErrors: [] as string[],
    stepsCompleted: [] as string[],
    hasError: false,
    pageResponse: '',
    networkRequests: [] as any[],
    patchUserResponse: null as any
  };

  try {
    console.log('=== 开始测试用户编辑功能 ===\n');
    
    // 1. 启动浏览器
    console.log('Step 1: 启动浏览器...');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    result.stepsCompleted.push('启动浏览器');

    // 监听控制台消息
    page.on('console', msg => {
      if (msg.type() === 'error') {
        result.consoleErrors.push(msg.text());
        console.log(`[Console Error] ${msg.text()}`);
      }
    });
    
    // 监听页面错误
    page.on('pageerror', err => {
      result.consoleErrors.push(err.message);
      console.log(`[Page Error] ${err.message}`);
    });

    // 监听网络请求
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      const method = response.request().method();
      
      // 记录所有请求
      result.networkRequests.push({
        url,
        method,
        status,
        statusText: response.statusText()
      });
      
      // 特别关注 PATCH /user 请求
      if (method === 'PATCH' && url.includes('/user')) {
        console.log(`[Network] PATCH /user - Status: ${status}`);
        
        response.text().then(text => {
          try {
            const json = JSON.parse(text);
            result.patchUserResponse = json;
            console.log(`  响应内容: ${JSON.stringify(json)}`);
          } catch {
            result.patchUserResponse = { raw: text };
            console.log(`  响应内容: ${text}`);
          }
        }).catch(err => {
          console.log(`  响应读取失败: ${err.message}`);
        });
      }
    });

    // 2. 访问账户设置页面
    console.log('Step 2: 访问 http://localhost:9980/setting/account');
    await page.goto('http://localhost:9980/setting/account', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    result.stepsCompleted.push('访问账户页面');
    
    // 截图 - 初始页面（可能是登录页）
    await page.screenshot({ path: `${screenshotsDir}/user-edit-01-initial-${timestamp}.png` });
    console.log(`  当前URL: ${page.url()}`);

    // 3. 登录
    console.log('Step 3: 登录 (账号: super, 密码: 123456)');
    
    // 检查是否需要登录
    const isLoginPage = page.url().includes('login');
    
    if (isLoginPage || (await page.$('input[placeholder*="账"]')) || (await page.$('input[type="text"]'))) {
      await page.fill('input[placeholder="输入账号"], input[placeholder*="账"], input[type="text"]', 'super');
      await page.fill('input[placeholder="输入密码"], input[placeholder*="密"], input[type="password"]', '123456');
      
      // 点击登录按钮
      const loginButton = page.locator('button:has-text("登录"), button:has-text("登"), button[type="submit"]').first();
      await loginButton.click();
      
      console.log('  已填写账号密码并点击登录');
    }
    
    // 等待登录响应
    await page.waitForTimeout(5000);
    result.stepsCompleted.push('登录');
    
    // 截图 - 登录后
    await page.screenshot({ path: `${screenshotsDir}/user-edit-02-after-login-${timestamp}.png` });
    console.log(`  登录后URL: ${page.url()}`);
    
    // 4. 查找并点击编辑按钮
    console.log('Step 4: 点击任意用户的"编辑"按钮');
    
    // 等待页面加载完成
    await page.waitForTimeout(2000);
    
    // 查找编辑按钮
    const editButton = page.locator('button:has-text("编辑"), button:has([class*="edit"]), [class*="edit"]').first();
    
    // 检查按钮是否可见
    const isEditVisible = await editButton.isVisible().catch(() => false);
    
    if (!isEditVisible) {
      // 尝试其他方式查找编辑按钮
      const editButtonsAll = await page.locator('button').all();
      for (const btn of editButtonsAll) {
        const text = await btn.textContent().catch(() => '');
        if (text && text.includes('编辑')) {
          await btn.click();
          console.log('  点击了编辑按钮（通过遍历）');
          break;
        }
      }
    } else {
      await editButton.click();
      console.log('  点击了编辑按钮');
    }
    
    result.stepsCompleted.push('点击编辑按钮');
    
    // 等待弹窗打开
    await page.waitForTimeout(1500);
    
    // 截图 - 编辑弹窗
    await page.screenshot({ path: `${screenshotsDir}/user-edit-03-edit-modal-${timestamp}.png` });

    // 5. 修改昵称为 "测试修改"
    console.log('Step 5: 修改昵称为 "测试修改"');
    
    // 查找输入框 - 尝试多种选择器
    let nicknameInput = page.locator('input[placeholder*="昵称"], input[placeholder*="名称"], input[class*="nick"]').first();
    
    // 如果上面的选择器找不到，尝试更通用的方式
    if (!(await nicknameInput.isVisible().catch(() => false))) {
      // 查找弹窗内的所有输入框
      const modalInputs = (await page.locator('.n-modal input, .ant-modal input, [class*="modal"] input').all());
      if (modalInputs.length > 0) {
        nicknameInput = modalInputs[0]; // 第一个通常是昵称
      }
    }
    
    // 清空并填写新昵称
    await nicknameInput.fill('测试修改');
    console.log('  已填写昵称: 测试修改');
    
    result.stepsCompleted.push('修改昵称');

    // 截图 - 填写后
    await page.screenshot({ path: `${screenshotsDir}/user-edit-04-filled-${timestamp}.png` });

    // 6. 点击确定提交
    console.log('Step 6: 点击确定提交');
    
    const submitButton = page.locator('button:has-text("确定"), button:has-text("确"), [class*="submit"]').first();
    await submitButton.click();
    console.log('  已点击确定按钮');
    
    result.stepsCompleted.push('点击确定');
    
    // 等待提交结果
    await page.waitForTimeout(2000);
    
    // 截图 - 提交后
    await page.screenshot({ path: `${screenshotsDir}/user-edit-05-after-submit-${timestamp}.png` });

    // 7. 检查是否成功
    console.log('Step 7: 检查操作结果');
    
    // 检查成功提示
    const successToast = page.locator('.ant-message-success, .n-message--success, [class*="success"], .el-message--success').first();
    const isSuccessVisible = await successToast.isVisible().catch(() => false);
    
    // 检查错误提示
    const errorToast = page.locator('.ant-message-error, .n-message--error, [class*="error"], .el-message--error').first();
    const isErrorVisible = await errorToast.isVisible().catch(() => false);
    
    // 获取页面响应状态
    result.pageResponse = page.url();
    
    if (isSuccessVisible) {
      console.log('  ✓ 操作成功！');
      result.success = true;
      result.stepsCompleted.push('操作成功');
    } else if (isErrorVisible) {
      const errorText = (await errorToast.textContent()) || '未知错误';
      console.log(`  ✗ 操作失败: ${errorText}`);
      result.errors.push(errorText);
      result.hasError = true;
    } else {
      // 检查弹窗是否关闭（通常意味着成功）
      const modalStillOpen = await page.locator('.n-modal, .ant-modal, [class*="modal"]').first().isVisible().catch(() => false);
      if (!modalStillOpen) {
        console.log('  ✓ 弹窗已关闭，操作可能成功');
        result.success = true;
        result.stepsCompleted.push('操作完成（弹窗已关闭）');
      } else {
        console.log('  ⚠ 无法确定操作结果');
        result.stepsCompleted.push('结果未知');
      }
    }

    // 最终截图
    await page.screenshot({ path: `${screenshotsDir}/user-edit-06-final-${timestamp}.png` });

  } catch (error: any) {
    console.error(`\n✗ 测试异常: ${error.message}`);
    result.errors.push(error.message);
    result.hasError = true;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

    // 输出最终结果
  console.log('\n=== 测试结果 ===');
  console.log(`操作结果: ${result.success ? '成功' : '失败'}`);
  console.log(`是否有错误: ${result.hasError ? '是' : '否'}`);
  console.log(`页面响应: ${result.pageResponse}`);
  
  console.log('\n=== 网络请求记录 ===');
  result.networkRequests.forEach(req => {
    console.log(`[${req.method}] ${req.url} - ${req.status} ${req.statusText}`);
  });
  
  if (result.patchUserResponse) {
    console.log('\n=== PATCH /user 响应详情 ===');
    console.log(JSON.stringify(result.patchUserResponse, null, 2));
  }
  
  if (result.errors.length > 0) {
    console.log(`错误信息: ${result.errors.join('; ')}`);
  }
  
  if (result.consoleErrors.length > 0) {
    console.log(`控制台错误: ${result.consoleErrors.join('; ')}`);
  }
  
  console.log(`完成步骤: ${result.stepsCompleted.join(' → ')}`);
  
  return result;
}

testUserEdit().then(result => {
  console.log('\n=== JSON 结果 ===');
  console.log(JSON.stringify(result, null, 2));
});