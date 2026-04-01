const { chromium } = require('playwright');

async function testUserEdit() {
  let browser = null;
  const screenshotsDir = '/Users/wangxiaoping/fayzedu/novasys/playwright/screenshots';
  const timestamp = Date.now();
  
  const result = {
    success: false,
    errors: [],
    consoleErrors: [],
    stepsCompleted: [],
    hasError: false,
    pageResponse: '',
    networkRequests: [],
    patchUserResponse: null
  };

  try {
    console.log('=== 开始测试用户编辑功能 ===\n');
    
    console.log('Step 1: 启动浏览器...');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    result.stepsCompleted.push('启动浏览器');

    page.on('console', msg => {
      if (msg.type() === 'error') {
        result.consoleErrors.push(msg.text());
        console.log(`[Console Error] ${msg.text()}`);
      }
    });
    
    page.on('pageerror', err => {
      result.consoleErrors.push(err.message);
      console.log(`[Page Error] ${err.message}`);
    });

    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      const method = response.request().method();
      
      result.networkRequests.push({
        url,
        method,
        status,
        statusText: response.statusText()
      });
      
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

    console.log('Step 2: 访问 http://localhost:9980/setting/account');
    await page.goto('http://localhost:9980/setting/account', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    result.stepsCompleted.push('访问账户页面');
    
    await page.screenshot({ path: `${screenshotsDir}/user-edit-01-initial-${timestamp}.png` });
    console.log(`  当前URL: ${page.url()}`);

    console.log('Step 3: 登录 (账号: super, 密码: 123456)');
    
    const isLoginPage = page.url().includes('login');
    
    if (isLoginPage || (await page.$('input[placeholder*="账"]')) || (await page.$('input[type="text"]'))) {
      await page.fill('input[placeholder="输入账号"], input[placeholder*="账"], input[type="text"]', 'super');
      await page.fill('input[placeholder="输入密码"], input[placeholder*="密"], input[type="password"]', '123456');
      
      const loginButton = page.locator('button:has-text("登录"), button:has-text("登"), button[type="submit"]').first();
      await loginButton.click();
      
      console.log('  已填写账号密码并点击登录');
    }
    
    await page.waitForTimeout(5000);
    result.stepsCompleted.push('登录');
    
    await page.screenshot({ path: `${screenshotsDir}/user-edit-02-after-login-${timestamp}.png` });
    console.log(`  登录后URL: ${page.url()}`);

    console.log('Step 4: 点击任意用户的"编辑"按钮');
    
    await page.waitForTimeout(2000);
    
    const editButton = page.locator('button:has-text("编辑"), button:has([class*="edit"]), [class*="edit"]').first();
    
    const isEditVisible = await editButton.isVisible().catch(() => false);
    
    if (!isEditVisible) {
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
    
    await page.waitForTimeout(1500);
    
    await page.screenshot({ path: `${screenshotsDir}/user-edit-03-edit-modal-${timestamp}.png` });

    console.log('Step 5: 修改昵称为 "测试修改"');
    
    let nicknameInput = page.locator('input[placeholder*="昵称"], input[placeholder*="名称"], input[class*="nick"]').first();
    
    if (!(await nicknameInput.isVisible().catch(() => false))) {
      const modalInputs = (await page.locator('.n-modal input, .ant-modal input, [class*="modal"] input').all());
      if (modalInputs.length > 0) {
        nicknameInput = modalInputs[0];
      }
    }
    
    await nicknameInput.fill('测试修改');
    console.log('  已填写昵称: 测试修改');
    
    result.stepsCompleted.push('修改昵称');

    await page.screenshot({ path: `${screenshotsDir}/user-edit-04-filled-${timestamp}.png` });

    console.log('Step 6: 点击确定提交');
    
    await page.waitForTimeout(2000);
    
    const submitButton = page.locator('.n-modal button[type="primary"], .ant-modal button[type="submit"]').first();
    const isSubmitVisible = await submitButton.isVisible().catch(() => false);
    
    console.log(`  提交按钮可见: ${isSubmitVisible}`);
    
    if (isSubmitVisible) {
      await submitButton.click({ timeout: 10000 });
      console.log('  已点击提交按钮');
    } else {
      console.log('  未找到提交按钮，尝试按钮文本查找');
      const allButtons = await page.locator('.n-modal button').all();
      for (const btn of allButtons) {
        const btnText = await btn.textContent().catch(() => '');
        if (btnText.includes('提交')) {
          await btn.click();
          console.log('  已点击提交按钮（通过文本）');
          break;
        }
      }
    }
    
    result.stepsCompleted.push('点击确定');
    
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: `${screenshotsDir}/user-edit-05-after-submit-${timestamp}.png` });

    console.log('Step 7: 检查操作结果');
    
    const successToast = page.locator('.ant-message-success, .n-message--success, [class*="success"], .el-message--success').first();
    const isSuccessVisible = await successToast.isVisible().catch(() => false);
    
    const errorToast = page.locator('.ant-message-error, .n-message--error, [class*="error"], .el-message--error').first();
    const isErrorVisible = await errorToast.isVisible().catch(() => false);
    
    result.pageResponse = page.url();
    
    if (isSuccessVisible) {
      console.log('  操作成功！');
      result.success = true;
      result.stepsCompleted.push('操作成功');
    } else if (isErrorVisible) {
      const errorText = (await errorToast.textContent()) || '未知错误';
      console.log(`  操作失败: ${errorText}`);
      result.errors.push(errorText);
      result.hasError = true;
    } else {
      const modalStillOpen = await page.locator('.n-modal, .ant-modal, [class*="modal"]').first().isVisible().catch(() => false);
      if (!modalStillOpen) {
        console.log('  弹窗已关闭，操作可能成功');
        result.success = true;
        result.stepsCompleted.push('操作完成（弹窗已关闭）');
      } else {
        console.log('  无法确定操作结果');
        result.stepsCompleted.push('结果未知');
      }
    }

    await page.screenshot({ path: `${screenshotsDir}/user-edit-06-final-${timestamp}.png` });

  } catch (error) {
    console.error(`\n测试异常: ${error.message}`);
    result.errors.push(error.message);
    result.hasError = true;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

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
  
  console.log(`完成步骤: ${result.stepsCompleted.join(' -> ')}`);
  
  console.log('\n=== JSON 结果 ===');
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

testUserEdit();