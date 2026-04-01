const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 监听网络请求
  let lastResponse = null;
  page.on('response', (response) => {
    if (response.url().includes('/api/') || response.url().includes('/user/')) {
      lastResponse = response;
    }
  });

  // 监听控制台错误
  let consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    console.log('1. 打开浏览器访问 http://localhost:9980/setting/account');
    await page.goto('http://localhost:9980/setting/account', { waitUntil: 'networkidle' });
    console.log('   页面加载完成');

    console.log('2. 登录（账号: super, 密码: 123456）');
    // 等待登录表单出现
    await page.waitForSelector('input[type="text"], input[name="username"], input[name="account"]', { timeout: 5000 }).catch(() => {});
    
    // 输入账号
    const usernameInput = await page.$('input[type="text"]');
    if (usernameInput) {
      await usernameInput.fill('super');
    } else {
      // 尝试其他选择器
      const inputs = await page.$$('input');
      for (const input of inputs) {
        const placeholder = await input.getAttribute('placeholder') || '';
        if (placeholder.includes('账') || placeholder.includes('用户') || placeholder.includes('账号')) {
          await input.fill('super');
          break;
        }
      }
    }

    // 输入密码
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.fill('123456');
    }

    // 点击登录按钮
    const loginButton = await page.$('button[type="submit"], button:has-text("登录"), button:has-text("登 录")');
    if (loginButton) {
      await loginButton.click();
      console.log('   点击登录按钮');
      await page.waitForTimeout(2000);
    }

    console.log('3. 点击第一个用户的"编辑"按钮');
    // 等待页面加载完成
    await page.waitForTimeout(1000);
    
    // 查找编辑按钮
    const editButtons = await page.$$('button:has-text("编辑"), button:has-text("编辑"), [data-testid="edit"]');
    if (editButtons.length > 0) {
      await editButtons[0].click();
      console.log('   点击第一个编辑按钮');
      await page.waitForTimeout(1000);
    } else {
      console.log('   未找到编辑按钮，尝试其他方式...');
      // 尝试查找表格中的编辑按钮
      const editBtnInTable = await page.$$('button.btn-primary, button.edit, .edit-btn');
      if (editBtnInTable.length > 0) {
        await editBtnInTable[0].click();
        console.log('   点击表格中的编辑按钮');
        await page.waitForTimeout(1000);
      }
    }

    console.log('4. 修改昵称为 "最终测试"');
    // 查找昵称输入框
    const nicknameInput = await page.$('input[name="nickname"], input[name="nickName"], input[placeholder*="昵称"]');
    if (nicknameInput) {
      // 清空并输入新昵称
      await nicknameInput.fill('');
      await nicknameInput.fill('最终测试');
      console.log('   输入新昵称: 最终测试');
    } else {
      // 尝试其他选择器
      const inputs = await page.$$('input');
      for (const input of inputs) {
        const name = await input.getAttribute('name') || '';
        const placeholder = await input.getAttribute('placeholder') || '';
        if (name.includes('nick') || placeholder.includes('昵称')) {
          await input.fill('');
          await input.fill('最终测试');
          console.log('   找到并输入昵称');
          break;
        }
      }
    }

    console.log('5. 点击"提交"按钮');
    const submitButton = await page.$('button[type="submit"], button:has-text("提交"), button:has-text("保存"), button:has-text("确 定")');
    if (submitButton) {
      await submitButton.click();
      console.log('   点击提交按钮');
      await page.waitForTimeout(2000);
    }

    console.log('6. 检查结果');
    // 检查控制台错误
    if (consoleErrors.length > 0) {
      console.log('   ❌ 有控制台错误:');
      consoleErrors.forEach(err => console.log('      - ' + err));
    } else {
      console.log('   ✅ 无控制台错误');
    }

    // 检查最后响应的状态
    if (lastResponse) {
      const status = lastResponse.status();
      const url = lastResponse.url();
      console.log('   网络响应 - URL: ' + url);
      console.log('   网络响应 - 状态码: ' + status);
      
      if (status >= 200 && status < 300) {
        console.log('   ✅ 请求成功 (状态码 2xx)');
      } else {
        console.log('   ❌ 请求失败 (状态码 ' + status + ')');
      }
      
      // 尝试获取响应内容
      try {
        const body = await lastResponse.text();
        console.log('   响应内容: ' + (body.length > 200 ? body.substring(0, 200) + '...' : body));
      } catch (e) {
        console.log('   无法读取响应内容');
      }
    } else {
      console.log('   ⚠️ 未捕获到网络响应');
    }

    // 截图保存结果
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/test-result.png' });
    console.log('   截图已保存: test-result.png');

  } catch (error) {
    console.log('❌ 执行过程中出错:');
    console.log('   ' + error.message);
  } finally {
    await browser.close();
  }
})();
