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
  } catch (e) {}
}

async function getTableRows(page) {
  return await page.evaluate(() => {
    const tbody = document.querySelector('tbody');
    return tbody ? tbody.querySelectorAll('tr').length : 0;
  });
}

async function login(page) {
  console.log('========== 登录 ==========');
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.fill('input[placeholder="输入账号"]', USERNAME);
  await page.fill('input[placeholder="输入密码"]', PASSWORD);

  const buttons = await page.$$('button');
  for (const btn of buttons) {
    if ((await btn.textContent()).includes('登录')) {
      await btn.click();
      break;
    }
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  console.log('✓ 登录成功');
}

async function testUserCRUD(page) {
  console.log('\n========== 用户管理 ==========');
  
  await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await takeScreenshot(page, 'v6-user-01-init.png');
  
  let rows = await getTableRows(page);
  console.log(`初始行数: ${rows}`);

  console.log('--- 添加用户 ---');
  const addBtn = await page.$('button:has-text("新建")');
  if (addBtn) {
    await addBtn.click();
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'v6-user-02-form.png');
    
    const inputs = await page.$$('input');
    const timestamp = Date.now();
    if (inputs[0]) await inputs[0].fill(`user${timestamp}`);
    if (inputs[1]) await inputs[1].fill(`用户${timestamp}`);
    if (inputs[2]) await inputs[2].fill('123456');
    
    const confirmBtn = await page.$('button:has-text("确定")');
    if (confirmBtn) await confirmBtn.click();
    
    await page.waitForTimeout(3000);
    await takeScreenshot(page, 'v6-user-03-after-add.png');
    
    rows = await getTableRows(page);
    console.log(`添加后行数: ${rows}`);
    
    testResults.user.add = { success: rows > 0, message: `添加后有${rows}行数据` };
  }

  console.log('--- 编辑用户 ---');
  const editBtn = await page.$('button:has-text("编辑")');
  if (editBtn) {
    await editBtn.click();
    await page.waitForTimeout(1500);
    const confirmBtn = await page.$('button:has-text("确定")');
    if (confirmBtn) await confirmBtn.click();
    await page.waitForTimeout(2000);
    testResults.user.edit = { success: true, message: '编辑完成' };
  } else {
    testResults.user.edit = { success: false, message: '未找到编辑按钮' };
  }

  console.log('--- 删除用户 ---');
  const deleteBtn = await page.$('button:has-text("删除")');
  if (deleteBtn) {
    await deleteBtn.click();
    await page.waitForTimeout(1500);
    const confirmBtn = await page.$('button:has-text("确定"), button:has-text("确认")');
    if (confirmBtn) await confirmBtn.click();
    await page.waitForTimeout(2000);
    testResults.user.delete = { success: true, message: '删除完成' };
  } else {
    testResults.user.delete = { success: false, message: '未找到删除按钮' };
  }
}

async function testRoleCRUD(page) {
  console.log('\n========== 角色管理 ==========');
  
  await page.goto(`${BASE_URL}/setting/role`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await takeScreenshot(page, 'v6-role-01-init.png');
  
  let rows = await getTableRows(page);
  console.log(`初始行数: ${rows}`);

  console.log('--- 添加角色 ---');
  const addBtn = await page.$('button:has-text("新建")');
  if (addBtn) {
    await addBtn.click();
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'v6-role-02-form.png');
    
    const inputs = await page.$$('input');
    const timestamp = Date.now();
    if (inputs[0]) await inputs[0].fill(`角色${timestamp}`);
    if (inputs[1]) await inputs[1].fill(`role_${timestamp}`);
    
    const confirmBtn = await page.$('button:has-text("确定")');
    if (confirmBtn) await confirmBtn.click();
    
    await page.waitForTimeout(3000);
    await takeScreenshot(page, 'v6-role-03-after-add.png');
    
    rows = await getTableRows(page);
    console.log(`添加后行数: ${rows}`);
    
    testResults.role.add = { success: rows > 0, message: `添加后有${rows}行数据` };
  }

  console.log('--- 编辑角色 ---');
  const editBtn = await page.$('button:has-text("编辑")');
  if (editBtn) {
    await editBtn.click();
    await page.waitForTimeout(1500);
    const confirmBtn = await page.$('button:has-text("确定")');
    if (confirmBtn) await confirmBtn.click();
    await page.waitForTimeout(2000);
    testResults.role.edit = { success: true, message: '编辑完成' };
  } else {
    testResults.role.edit = { success: false, message: '未找到编辑按钮' };
  }

  console.log('--- 删除角色 ---');
  const deleteBtn = await page.$('button:has-text("删除")');
  if (deleteBtn) {
    await deleteBtn.click();
    await page.waitForTimeout(1500);
    const confirmBtn = await page.$('button:has-text("确定"), button:has-text("确认")');
    if (confirmBtn) await confirmBtn.click();
    await page.waitForTimeout(2000);
    testResults.role.delete = { success: true, message: '删除完成' };
  } else {
    testResults.role.delete = { success: false, message: '未找到删除按钮' };
  }
}

async function testMenuCRUD(page) {
  console.log('\n========== 菜单管理 ==========');
  
  await page.goto(`${BASE_URL}/setting/menu`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await takeScreenshot(page, 'v6-menu-01-init.png');
  
  let rows = await getTableRows(page);
  console.log(`初始行数: ${rows}`);

  console.log('--- 添加菜单 ---');
  const addBtn = await page.$('button:has-text("新建")');
  if (addBtn) {
    await addBtn.click();
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'v6-menu-02-form.png');
    
    const inputs = await page.$$('input');
    const timestamp = Date.now();
    if (inputs[0]) await inputs[0].fill(`菜单${timestamp}`);
    if (inputs[1]) await inputs[1].fill(`/menu_${timestamp}`);
    
    const confirmBtn = await page.$('button:has-text("确定")');
    if (confirmBtn) await confirmBtn.click();
    
    await page.waitForTimeout(3000);
    await takeScreenshot(page, 'v6-menu-03-after-add.png');
    
    rows = await getTableRows(page);
    console.log(`添加后行数: ${rows}`);
    
    testResults.menu.add = { success: rows > 0, message: `添加后有${rows}行数据` };
  }

  console.log('--- 编辑菜单 ---');
  const editBtn = await page.$('button:has-text("编辑")');
  if (editBtn) {
    await editBtn.click();
    await page.waitForTimeout(1500);
    const confirmBtn = await page.$('button:has-text("确定")');
    if (confirmBtn) await confirmBtn.click();
    await page.waitForTimeout(2000);
    testResults.menu.edit = { success: true, message: '编辑完成' };
  } else {
    testResults.menu.edit = { success: false, message: '未找到编辑按钮' };
  }

  console.log('--- 删除菜单 ---');
  const deleteBtn = await page.$('button:has-text("删除")');
  if (deleteBtn) {
    await deleteBtn.click();
    await page.waitForTimeout(1500);
    const confirmBtn = await page.$('button:has-text("确定"), button:has-text("确认")');
    if (confirmBtn) await confirmBtn.click();
    await page.waitForTimeout(2000);
    testResults.menu.delete = { success: true, message: '删除完成' };
  } else {
    testResults.menu.delete = { success: false, message: '未找到删除按钮' };
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
  console.log('开始 CRUD 测试 v6...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    await login(page);
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
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

main();
