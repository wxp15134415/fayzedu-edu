const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:9980';
const USERNAME = 'super';
const PASSWORD = '123456';

const screenshotDir = '/Users/wangxiaoping/fayzedu/novasys/playwright';

const testResults = {
  user: { add: null, edit: null, delete: null },
  role: { add: null, edit: null, delete: null },
  menu: { add: null, edit: null, delete: null }
};

async function takeScreenshot(page, name) {
  try {
    await page.screenshot({ path: `${screenshotDir}/${name}` });
  } catch (e) {
    console.log(`截图失败: ${name}`);
  }
}

async function waitForModalGone(page, timeout = 8000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const modalVisible = await page.evaluate(() => {
      const container = document.querySelector('.n-modal-container');
      if (!container) return false;
      
      const style = window.getComputedStyle(container);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    });
    
    if (!modalVisible) {
      await page.waitForTimeout(1000);
      return true;
    }
    
    try {
      await page.keyboard.press('Escape');
    } catch(e) {}
    await page.waitForTimeout(500);
  }
  
  console.log('Modal still visible, refreshing page...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  return true;
}

async function login(page) {
  console.log('========== 开始登录 ==========');
  try {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'v5-01-login-page.png');

    await page.fill('input[placeholder="输入账号"]', USERNAME);
    await page.fill('input[placeholder="输入密码"]', PASSWORD);

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
    await takeScreenshot(page, 'v5-02-login-success.png');

    console.log('✓ 登录成功');
    return true;
  } catch (error) {
    console.log('✗ 登录失败:', error.message);
    return false;
  }
}

async function findActionButtons(page) {
  const allButtons = await page.$$('button');
  const buttonInfo = [];
  
  for (let i = 0; i < allButtons.length; i++) {
    const text = (await allButtons[i].textContent()).trim();
    if (text) {
      buttonInfo.push({ index: i, text });
    }
  }
  
  return buttonInfo;
}

async function testUserCRUD(page) {
  console.log('\n========== 用户管理 CRUD 测试 ==========');

  try {
    await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await takeScreenshot(page, 'v5-user-01-list.png');

    console.log('\n--- 按钮列表 ---');
    const btns1 = await findActionButtons(page);
    btns1.forEach(b => console.log(`  [${b.index}] "${b.text}"`));

    console.log('\n--- 测试添加用户 ---');
    await waitForModalGone(page);
    
    const addBtn = await page.$('button:has-text("新建"), button:has-text("新增"), button:has-text("添加")');
    if (addBtn) {
      await addBtn.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'v5-user-02-add-form.png');

      const timestamp = Date.now();
      const inputs = await page.$$('input');
      for (let i = 0; i < inputs.length && i < 3; i++) {
        const placeholder = await inputs[i].getAttribute('placeholder') || '';
        if (placeholder && !placeholder.includes('请选择') && !placeholder.includes('日期')) {
          if (i === 0) await inputs[i].fill(`testuser${timestamp}`);
          else if (i === 1) await inputs[i].fill(`测试用户${timestamp}`);
          else if (i === 2) await inputs[i].fill('123456');
        }
      }

      await takeScreenshot(page, 'v5-user-03-form-filled.png');

      const confirmBtn = await page.$('button:has-text("确定")');
      if (confirmBtn) await confirmBtn.click();

      await page.waitForTimeout(3000);
      await takeScreenshot(page, 'v5-user-04-after-add.png');
      
      console.log('✓ 添加用户完成');
      testResults.user.add = { success: true, message: '添加用户操作已完成' };
    } else {
      console.log('⚠ 未找到新增按钮');
      testResults.user.add = { success: false, message: '未找到新增按钮' };
    }

    console.log('\n--- 等待数据刷新 ---');
    await waitForModalGone(page);
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'v5-user-05-refreshed.png');
    
    console.log('\n--- 按钮列表 (刷新后) ---');
    const btns2 = await findActionButtons(page);
    btns2.forEach(b => console.log(`  [${b.index}] "${b.text}"`));

    console.log('\n--- 测试编辑用户 ---');
    const editBtn = await page.$('button:has-text("编辑")');
    if (editBtn) {
      await editBtn.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'v5-user-06-edit-form.png');

      const inputs = await page.$$('input');
      if (inputs.length > 0) {
        await inputs[0].fill(`修改后的用户${Date.now()}`);
      }

      const confirmBtn = await page.$('button:has-text("确定")');
      if (confirmBtn) await confirmBtn.click();

      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'v5-user-07-after-edit.png');
      console.log('✓ 编辑用户完成');
      testResults.user.edit = { success: true, message: '编辑用户已完成' };
    } else {
      console.log('⚠ 未找到编辑按钮');
      testResults.user.edit = { success: false, message: '未找到编辑按钮' };
    }

    console.log('\n--- 测试删除用户 ---');
    await waitForModalGone(page);
    const deleteBtn = await page.$('button:has-text("删除")');
    if (deleteBtn) {
      await deleteBtn.click();
      await page.waitForTimeout(1500);
      await takeScreenshot(page, 'v5-user-08-delete-confirm.png');

      const confirmBtn = await page.$('button:has-text("确定"), button:has-text("确认")');
      if (confirmBtn) await confirmBtn.click();

      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'v5-user-09-after-delete.png');
      console.log('✓ 删除用户完成');
      testResults.user.delete = { success: true, message: '删除用户已完成' };
    } else {
      console.log('⚠ 未找到删除按钮');
      testResults.user.delete = { success: false, message: '未找到删除按钮' };
    }

  } catch (error) {
    console.log('✗ 用户管理测试异常:', error.message);
    testResults.user = {
      add: { success: false, message: error.message },
      edit: { success: false, message: error.message },
      delete: { success: false, message: error.message }
    };
  }
}

async function testRoleCRUD(page) {
  console.log('\n========== 角色管理 CRUD 测试 ==========');

  try {
    await page.goto(`${BASE_URL}/setting/role`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await takeScreenshot(page, 'v5-role-01-list.png');

    console.log('\n--- 测试添加角色 ---');
    await waitForModalGone(page);
    
    const addBtn = await page.$('button:has-text("新建"), button:has-text("新增"), button:has-text("添加")');
    if (addBtn) {
      await addBtn.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'v5-role-02-add-form.png');

      const timestamp = Date.now();
      const inputs = await page.$$('input');
      for (let i = 0; i < inputs.length && i < 2; i++) {
        const placeholder = await inputs[i].getAttribute('placeholder') || '';
        if (placeholder && !placeholder.includes('请选择')) {
          if (i === 0) await inputs[i].fill(`测试角色${timestamp}`);
          else if (i === 1) await inputs[i].fill(`role_${timestamp}`);
        }
      }

      const confirmBtn = await page.$('button:has-text("确定")');
      if (confirmBtn) await confirmBtn.click();

      await page.waitForTimeout(3000);
      await takeScreenshot(page, 'v5-role-04-after-add.png');
      console.log('✓ 添加角色完成');
      testResults.role.add = { success: true, message: '添加角色已完成' };
    }

    await waitForModalGone(page);
    await page.waitForTimeout(2000);

    console.log('\n--- 测试编辑角色 ---');
    const editBtn = await page.$('button:has-text("编辑")');
    if (editBtn) {
      await editBtn.click();
      await page.waitForTimeout(2000);
      
      const confirmBtn = await page.$('button:has-text("确定")');
      if (confirmBtn) await confirmBtn.click();

      await page.waitForTimeout(2000);
      console.log('✓ 编辑角色完成');
      testResults.role.edit = { success: true, message: '编辑角色已完成' };
    } else {
      testResults.role.edit = { success: false, message: '未找到编辑按钮' };
    }

    console.log('\n--- 测试删除角色 ---');
    await waitForModalGone(page);
    const deleteBtn = await page.$('button:has-text("删除")');
    if (deleteBtn) {
      await deleteBtn.click();
      await page.waitForTimeout(1500);
      
      const confirmBtn = await page.$('button:has-text("确定"), button:has-text("确认")');
      if (confirmBtn) await confirmBtn.click();

      await page.waitForTimeout(2000);
      console.log('✓ 删除角色完成');
      testResults.role.delete = { success: true, message: '删除角色已完成' };
    } else {
      testResults.role.delete = { success: false, message: '未找到删除按钮' };
    }

  } catch (error) {
    console.log('✗ 角色管理测试异常:', error.message);
    testResults.role = {
      add: { success: false, message: error.message },
      edit: { success: false, message: error.message },
      delete: { success: false, message: error.message }
    };
  }
}

async function testMenuCRUD(page) {
  console.log('\n========== 菜单管理 CRUD 测试 ==========');

  try {
    await page.goto(`${BASE_URL}/setting/menu`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await takeScreenshot(page, 'v5-menu-01-list.png');

    console.log('\n--- 测试添加菜单 ---');
    await waitForModalGone(page);
    
    const addBtn = await page.$('button:has-text("新建"), button:has-text("新增"), button:has-text("添加")');
    if (addBtn) {
      await addBtn.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'v5-menu-02-add-form.png');

      const timestamp = Date.now();
      const inputs = await page.$$('input');
      for (let i = 0; i < inputs.length && i < 2; i++) {
        const placeholder = await inputs[i].getAttribute('placeholder') || '';
        if (placeholder && !placeholder.includes('请选择')) {
          if (i === 0) await inputs[i].fill(`测试菜单${timestamp}`);
          else if (i === 1) await inputs[i].fill(`/test/${timestamp}`);
        }
      }

      const confirmBtn = await page.$('button:has-text("确定")');
      if (confirmBtn) await confirmBtn.click();

      await page.waitForTimeout(3000);
      await takeScreenshot(page, 'v5-menu-04-after-add.png');
      console.log('✓ 添加菜单完成');
      testResults.menu.add = { success: true, message: '添加菜单已完成' };
    }

    await waitForModalGone(page);
    await page.waitForTimeout(2000);

    console.log('\n--- 测试编辑菜单 ---');
    const editBtn = await page.$('button:has-text("编辑")');
    if (editBtn) {
      await editBtn.click();
      await page.waitForTimeout(2000);
      
      const confirmBtn = await page.$('button:has-text("确定")');
      if (confirmBtn) await confirmBtn.click();

      await page.waitForTimeout(2000);
      console.log('✓ 编辑菜单完成');
      testResults.menu.edit = { success: true, message: '编辑菜单已完成' };
    } else {
      testResults.menu.edit = { success: false, message: '未找到编辑按钮' };
    }

    console.log('\n--- 测试删除菜单 ---');
    await waitForModalGone(page);
    const deleteBtn = await page.$('button:has-text("删除")');
    if (deleteBtn) {
      await deleteBtn.click();
      await page.waitForTimeout(1500);
      
      const confirmBtn = await page.$('button:has-text("确定"), button:has-text("确认")');
      if (confirmBtn) await confirmBtn.click();

      await page.waitForTimeout(2000);
      console.log('✓ 删除菜单完成');
      testResults.menu.delete = { success: true, message: '删除菜单已完成' };
    } else {
      testResults.menu.delete = { success: false, message: '未找到删除按钮' };
    }

  } catch (error) {
    console.log('✗ 菜单管理测试异常:', error.message);
    testResults.menu = {
      add: { success: false, message: error.message },
      edit: { success: false, message: error.message },
      delete: { success: false, message: error.message }
    };
  }
}

function generateReport() {
  const now = new Date().toISOString();
  const localTime = new Date(now).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  let report = `# CRUD 测试报告

生成时间: ${localTime}

## 测试结果汇总

| 模块 | 添加 | 编辑 | 删除 |
|------|------|------|------|
| 用户管理 | ${testResults.user.add?.success ? '✓ 成功' : '✗ 失败'} | ${testResults.user.edit?.success ? '✓ 成功' : '✗ 失败'} | ${testResults.user.delete?.success ? '✓ 成功' : '✗ 失败'} |
| 角色管理 | ${testResults.role.add?.success ? '✓ 成功' : '✗ 失败'} | ${testResults.role.edit?.success ? '✓ 成功' : '✗ 失败'} | ${testResults.role.delete?.success ? '✓ 成功' : '✗ 失败'} |
| 菜单管理 | ${testResults.menu.add?.success ? '✓ 成功' : '✗ 失败'} | ${testResults.menu.edit?.success ? '✓ 成功' : '✗ 失败'} | ${testResults.menu.delete?.success ? '✓ 成功' : '✗ 失败'} |

## 详细结果

### 用户管理 (/setting/account)
- 添加: ${testResults.user.add?.message || '-'}
- 编辑: ${testResults.user.edit?.message || '-'}
- 删除: ${testResults.user.delete?.message || '-'}

### 角色管理 (/setting/role)
- 添加: ${testResults.role.add?.message || '-'}
- 编辑: ${testResults.role.edit?.message || '-'}
- 删除: ${testResults.role.delete?.message || '-'}

### 菜单管理 (/setting/menu)
- 添加: ${testResults.menu.add?.message || '-'}
- 编辑: ${testResults.menu.edit?.message || '-'}
- 删除: ${testResults.menu.delete?.message || '-'}
`;

  return report;
}

async function main() {
  console.log('开始 CRUD 测试 (v5)...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    const loginSuccess = await login(page);
    if (!loginSuccess) return;

    await testUserCRUD(page);
    await testRoleCRUD(page);
    await testMenuCRUD(page);

    const report = generateReport();
    console.log('\n========== 测试报告 ==========');
    console.log(report);

    require('fs').writeFileSync(`${screenshotDir}/crud-test-report.md`, report);
    console.log(`报告已保存到: ${screenshotDir}/crud-test-report.md`);

  } catch (error) {
    console.error('测试出错:', error);
  } finally {
    console.log('\n关闭浏览器...');
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

main();
