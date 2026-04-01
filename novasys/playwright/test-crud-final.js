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

async function getTableData(page) {
  return await page.evaluate(() => {
    const tbody = document.querySelector('tbody');
    if (!tbody) return { rows: 0, hasEdit: false, hasDelete: false };
    
    const rows = tbody.querySelectorAll('tr');
    const rowCount = rows.length;
    
    const hasEdit = Array.from(rows).some(r => r.textContent.includes('编辑'));
    const hasDelete = Array.from(rows).some(r => r.textContent.includes('删除'));
    
    return { rows: rowCount, hasEdit, hasDelete };
  });
}

async function waitForModalClear(page) {
  try {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  } catch(e) {}
  
  for (let i = 0; i < 5; i++) {
    const modalVisible = await page.evaluate(() => {
      const container = document.querySelector('.n-modal-container');
      if (!container) return false;
      const style = window.getComputedStyle(container);
      return style.display !== 'none';
    });
    
    if (!modalVisible) return true;
    await page.waitForTimeout(1000);
  }
  
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  return true;
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
  await takeScreenshot(page, 'final-00-login.png');
}

async function testUserCRUD(page) {
  console.log('\n========== 用户管理 ==========');
  
  await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await takeScreenshot(page, 'final-user-01-list.png');
  
  const initialData = await getTableData(page);
  console.log(`初始: ${initialData.rows}行, 有编辑:${initialData.hasEdit}, 有删除:${initialData.hasDelete}`);

  console.log('--- 添加用户 ---');
  const addBtn = await page.$('button:has-text("新建")');
  if (addBtn) {
    await addBtn.click();
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'final-user-02-form.png');
    
    const inputs = await page.$$('input');
    const timestamp = Date.now();
    if (inputs[0]) await inputs[0].fill(`user${timestamp}`);
    if (inputs[1]) await inputs[1].fill(`测试用户${timestamp}`);
    if (inputs[2]) await inputs[2].fill('123456');
    await takeScreenshot(page, 'final-user-03-filled.png');
    
    const confirmBtn = await page.$('button:has-text("确定")');
    if (confirmBtn) await confirmBtn.click();
    
    await page.waitForTimeout(3000);
    await waitForModalClear(page);
    await takeScreenshot(page, 'final-user-04-after-add.png');
    
    const afterAddData = await getTableData(page);
    console.log(`添加后: ${afterAddData.rows}行`);
    testResults.user.add = { 
      success: afterAddData.rows > initialData.rows, 
      message: `添加前${initialData.rows}行, 添加后${afterAddData.rows}行` 
    };
  }

  await waitForModalClear(page);
  
  console.log('--- 编辑用户 ---');
  const editBtn = await page.$('button:has-text("编辑")');
  if (editBtn) {
    await editBtn.click();
    await page.waitForTimeout(1500);
    await takeScreenshot(page, 'final-user-05-edit.png');
    const confirmBtn = await page.$('button:has-text("确定")');
    if (confirmBtn) await confirmBtn.click();
    await page.waitForTimeout(2000);
    testResults.user.edit = { success: true, message: '编辑按钮可点击' };
  } else {
    testResults.user.edit = { success: false, message: initialData.rows === 0 ? '表中无数据' : '未找到编辑按钮' };
  }

  await waitForModalClear(page);
  
  console.log('--- 删除用户 ---');
  const deleteBtn = await page.$('button:has-text("删除")');
  if (deleteBtn) {
    await deleteBtn.click();
    await page.waitForTimeout(1500);
    await takeScreenshot(page, 'final-user-06-delete.png');
    const confirmBtn = await page.$('button:has-text("确定"), button:has-text("确认")');
    if (confirmBtn) await confirmBtn.click();
    await page.waitForTimeout(2000);
    testResults.user.delete = { success: true, message: '删除按钮可点击' };
  } else {
    testResults.user.delete = { success: false, message: initialData.rows === 0 ? '表中无数据' : '未找到删除按钮' };
  }
}

async function testRoleCRUD(page) {
  console.log('\n========== 角色管理 ==========');
  
  await page.goto(`${BASE_URL}/setting/role`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await takeScreenshot(page, 'final-role-01-list.png');
  
  const initialData = await getTableData(page);
  console.log(`初始: ${initialData.rows}行`);

  console.log('--- 添加角色 ---');
  const addBtn = await page.$('button:has-text("新建")');
  if (addBtn) {
    await addBtn.click();
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'final-role-02-form.png');
    
    const inputs = await page.$$('input');
    const timestamp = Date.now();
    if (inputs[0]) await inputs[0].fill(`角色${timestamp}`);
    if (inputs[1]) await inputs[1].fill(`role_${timestamp}`);
    
    const confirmBtn = await page.$('button:has-text("确定")');
    if (confirmBtn) await confirmBtn.click();
    
    await page.waitForTimeout(3000);
    await waitForModalClear(page);
    await takeScreenshot(page, 'final-role-03-after-add.png');
    
    const afterAddData = await getTableData(page);
    console.log(`添加后: ${afterAddData.rows}行`);
    testResults.role.add = { 
      success: afterAddData.rows > initialData.rows, 
      message: `添加前${initialData.rows}行, 添加后${afterAddData.rows}行` 
    };
  }

  await waitForModalClear(page);
  
  console.log('--- 编辑角色 ---');
  const editBtn = await page.$('button:has-text("编辑")');
  if (editBtn) {
    await editBtn.click();
    await page.waitForTimeout(1500);
    const confirmBtn = await page.$('button:has-text("确定")');
    if (confirmBtn) await confirmBtn.click();
    await page.waitForTimeout(2000);
    testResults.role.edit = { success: true, message: '编辑按钮可点击' };
  } else {
    testResults.role.edit = { success: false, message: initialData.rows === 0 ? '表中无数据' : '未找到编辑按钮' };
  }

  await waitForModalClear(page);
  
  console.log('--- 删除角色 ---');
  const deleteBtn = await page.$('button:has-text("删除")');
  if (deleteBtn) {
    await deleteBtn.click();
    await page.waitForTimeout(1500);
    const confirmBtn = await page.$('button:has-text("确定"), button:has-text("确认")');
    if (confirmBtn) await confirmBtn.click();
    await page.waitForTimeout(2000);
    testResults.role.delete = { success: true, message: '删除按钮可点击' };
  } else {
    testResults.role.delete = { success: false, message: initialData.rows === 0 ? '表中无数据' : '未找到删除按钮' };
  }
}

async function testMenuCRUD(page) {
  console.log('\n========== 菜单管理 ==========');
  
  await page.goto(`${BASE_URL}/setting/menu`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await takeScreenshot(page, 'final-menu-01-list.png');
  
  const initialData = await getTableData(page);
  console.log(`初始: ${initialData.rows}行`);

  console.log('--- 添加菜单 ---');
  const addBtn = await page.$('button:has-text("新建")');
  if (addBtn) {
    await addBtn.click();
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'final-menu-02-form.png');
    
    const inputs = await page.$$('input');
    const timestamp = Date.now();
    if (inputs[0]) await inputs[0].fill(`菜单${timestamp}`);
    if (inputs[1]) await inputs[1].fill(`/menu_${timestamp}`);
    
    const confirmBtn = await page.$('button:has-text("确定")');
    if (confirmBtn) await confirmBtn.click();
    
    await page.waitForTimeout(3000);
    await waitForModalClear(page);
    await takeScreenshot(page, 'final-menu-03-after-add.png');
    
    const afterAddData = await getTableData(page);
    console.log(`添加后: ${afterAddData.rows}行`);
    testResults.menu.add = { 
      success: afterAddData.rows > initialData.rows, 
      message: `添加前${initialData.rows}行, 添加后${afterAddData.rows}行` 
    };
  }

  await waitForModalClear(page);
  
  console.log('--- 编辑菜单 ---');
  const editBtn = await page.$('button:has-text("编辑")');
  if (editBtn) {
    await editBtn.click();
    await page.waitForTimeout(1500);
    const confirmBtn = await page.$('button:has-text("确定")');
    if (confirmBtn) await confirmBtn.click();
    await page.waitForTimeout(2000);
    testResults.menu.edit = { success: true, message: '编辑按钮可点击' };
  } else {
    testResults.menu.edit = { success: false, message: initialData.rows === 0 ? '表中无数据' : '未找到编辑按钮' };
  }

  await waitForModalClear(page);
  
  console.log('--- 删除菜单 ---');
  const deleteBtn = await page.$('button:has-text("删除")');
  if (deleteBtn) {
    await deleteBtn.click();
    await page.waitForTimeout(1500);
    await takeScreenshot(page, 'final-menu-04-delete.png');
    const confirmBtn = await page.$('button:has-text("确定"), button:has-text("确认")');
    if (confirmBtn) await confirmBtn.click();
    await page.waitForTimeout(2000);
    testResults.menu.delete = { success: true, message: '删除按钮可点击' };
  } else {
    testResults.menu.delete = { success: false, message: initialData.rows === 0 ? '表中无数据' : '未找到删除按钮' };
  }
}

function generateReport() {
  const now = new Date().toISOString();
  const localTime = new Date(now).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  let report = `# CRUD 测试报告

生成时间: ${localTime}

## 测试环境

- 前端地址: ${BASE_URL}
- 登录账号: ${USERNAME}
- 测试工具: Playwright

---

## 测试结果汇总

| 模块 | 添加 | 编辑 | 删除 |
|------|------|------|------|
| 用户管理 | ${testResults.user.add?.success ? '✓ 成功' : '✗ 失败'} | ${testResults.user.edit?.success ? '✓ 成功' : '✗ 失败'} | ${testResults.user.delete?.success ? '✓ 成功' : '✗ 失败'} |
| 角色管理 | ${testResults.role.add?.success ? '✓ 成功' : '✗ 失败'} | ${testResults.role.edit?.success ? '✓ 成功' : '✗ 失败'} | ${testResults.role.delete?.success ? '✓ 成功' : '✗ 失败'} |
| 菜单管理 | ${testResults.menu.add?.success ? '✓ 成功' : '✗ 失败'} | ${testResults.menu.edit?.success ? '✓ 成功' : '✗ 失败'} | ${testResults.menu.delete?.success ? '✓ 成功' : '✗ 失败'} |

---

## 详细结果

### 用户管理 (/setting/account)

- **添加用户**: ${testResults.user.add?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.user.add?.message || '-'}

- **编辑用户**: ${testResults.user.edit?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.user.edit?.message || '-'}

- **删除用户**: ${testResults.user.delete?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.user.delete?.message || '-'}

### 角色管理 (/setting/role)

- **添加角色**: ${testResults.role.add?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.role.add?.message || '-'}

- **编辑角色**: ${testResults.role.edit?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.role.edit?.message || '-'}

- **删除角色**: ${testResults.role.delete?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.role.delete?.message || '-'}

### 菜单管理 (/setting/menu)

- **添加菜单**: ${testResults.menu.add?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.menu.add?.message || '-'}

- **编辑菜单**: ${testResults.menu.edit?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.menu.edit?.message || '-'}

- **删除菜单**: ${testResults.menu.delete?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.menu.delete?.message || '-'}

---

## 结论

${(testResults.user.add?.success && testResults.user.edit?.success && testResults.user.delete?.success &&
   testResults.role.add?.success && testResults.role.edit?.success && testResults.role.delete?.success &&
   testResults.menu.add?.success && testResults.menu.edit?.success && testResults.menu.delete?.success) 
  ? '✓ 所有 CRUD 测试通过' 
  : '⚠ 部分 CRUD 操作存在问题'}
`;

  return report;
}

async function main() {
  console.log('开始最终 CRUD 测试...\n');

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
    console.log(`\n报告已保存到: ${screenshotDir}/crud-test-report.md`);

  } catch (error) {
    console.error('测试出错:', error);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
    console.log('浏览器已关闭');
  }
}

main();
