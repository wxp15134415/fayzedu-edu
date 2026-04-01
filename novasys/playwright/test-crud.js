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

async function waitAndClick(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
    return true;
  } catch (e) {
    console.log(`无法找到元素: ${selector}`);
    return false;
  }
}

async function takeScreenshot(page, name) {
  try {
    await page.screenshot({ path: `${screenshotDir}/${name}` });
    console.log(`截图保存: ${name}`);
  } catch (e) {
    console.log(`截图失败: ${name}`);
  }
}

async function login(page) {
  console.log('========== 开始登录 ==========');
  try {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '01-login-page.png');
    
    await page.fill('input[placeholder="输入账号"]', USERNAME);
    await page.fill('input[placeholder="输入密码"]', PASSWORD);
    await takeScreenshot(page, '02-login-filled.png');
    
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
    await takeScreenshot(page, '03-login-success.png');
    
    console.log('✓ 登录成功');
    return true;
  } catch (error) {
    console.log('✗ 登录失败:', error.message);
    await takeScreenshot(page, 'error-login.png');
    return false;
  }
}

async function testUserCRUD(page) {
  console.log('\n========== 用户管理 CRUD 测试 ==========');
  
  try {
    // 访问用户管理页面
    await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'user-01-list.png');
    console.log('访问用户管理页面');
    
    // 获取当前用户数量
    const getUserCount = async () => {
      const rows = await page.$$('tbody tr');
      return rows.length;
    };
    const initialCount = await getUserCount();
    console.log(`初始用户数量: ${initialCount}`);
    
    // 测试添加用户
    console.log('\n--- 测试添加用户 ---');
    const addButtons = await page.$$('button');
    let addBtnFound = false;
    for (const btn of addButtons) {
      const text = await btn.textContent();
      if (text && (text.includes('新增') || text.includes('添加') || text.includes('新建'))) {
        await btn.click();
        addBtnFound = true;
        break;
      }
    }
    
    if (addBtnFound) {
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'user-02-add-form.png');
      
      // 填写表单 - 根据系统实际情况调整选择器
      const timestamp = Date.now();
      const testUser = {
        username: `testuser${timestamp}`,
        nickName: `测试用户${timestamp}`,
        password: '123456'
      };
      
      // 尝试填写用户名
      try {
        await page.fill('input[placeholder="请输入用户名称"]', testUser.username);
      } catch (e) {
        await page.fill('input[placeholder="请输入用户名"]', testUser.username);
      }
      
      // 填写昵称
      try {
        await page.fill('input[placeholder="请输入用户昵称"]', testUser.nickName);
      } catch (e) {
        console.log('未找到昵称输入框');
      }
      
      // 填写密码
      try {
        await page.fill('input[type="password"]', testUser.password);
      } catch (e) {
        console.log('未找到密码输入框');
      }
      
      await takeScreenshot(page, 'user-03-form-filled.png');
      
      // 点击确定按钮
      const confirmButtons = await page.$$('button');
      for (const btn of confirmButtons) {
        const text = await btn.textContent();
        if (text && text.includes('确 定')) {
          await btn.click();
          break;
        }
      }
      
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'user-04-after-add.png');
      
      const finalCount = await getUserCount();
      if (finalCount > initialCount) {
        console.log('✓ 添加用户成功');
        testResults.user.add = { success: true, message: `用户已添加到列表，当前数量: ${finalCount}` };
      } else {
        console.log('✗ 添加用户失败或用户已存在');
        testResults.user.add = { success: false, message: '添加后用户数量未增加' };
      }
    } else {
      console.log('✗ 未找到新增按钮');
      testResults.user.add = { success: false, message: '未找到新增按钮' };
    }
    
    // 测试编辑用户
    console.log('\n--- 测试编辑用户 ---');
    const editButtons = await page.$$('button');
    let editBtnFound = false;
    for (const btn of editButtons) {
      const text = await btn.textContent();
      if (text && text.includes('编 辑')) {
        await btn.click();
        editBtnFound = true;
        break;
      }
    }
    
    if (editBtnFound) {
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'user-05-edit-form.png');
      
      // 修改昵称
      try {
        const nickInputs = await page.$$('input[placeholder*="昵称"]');
        if (nickInputs.length > 0) {
          await nickInputs[0].fill('');
          await nickInputs[0].fill(`修改后的昵称${Date.now()}`);
        }
      } catch (e) {
        console.log('修改昵称失败');
      }
      
      await takeScreenshot(page, 'user-06-edit-filled.png');
      
      // 点击确定
      const confirmBtns = await page.$$('button');
      for (const btn of confirmBtns) {
        const text = await btn.textContent();
        if (text && text.includes('确 定')) {
          await btn.click();
          break;
        }
      }
      
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'user-07-after-edit.png');
      console.log('✓ 编辑用户表单已提交');
      testResults.user.edit = { success: true, message: '编辑表单已提交' };
    } else {
      console.log('✗ 未找到编辑按钮');
      testResults.user.edit = { success: false, message: '未找到编辑按钮' };
    }
    
    // 测试删除用户
    console.log('\n--- 测试删除用户 ---');
    const deleteButtons = await page.$$('button');
    let deleteBtnFound = false;
    for (const btn of deleteButtons) {
      const text = await btn.textContent();
      if (text && text.includes('删 除')) {
        await btn.click();
        deleteBtnFound = true;
        break;
      }
    }
    
    if (deleteBtnFound) {
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'user-08-delete-confirm.png');
      
      // 确认删除
      const confirmDeleteButtons = await page.$$('button');
      for (const btn of confirmDeleteButtons) {
        const text = await btn.textContent();
        if (text && (text.includes('确 定') || text.includes('确认') || text.includes('删除'))) {
          await btn.click();
          break;
        }
      }
      
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'user-09-after-delete.png');
      
      const afterDeleteCount = await getUserCount();
      if (afterDeleteCount < finalCount) {
        console.log('✓ 删除用户成功');
        testResults.user.delete = { success: true, message: `用户已删除，当前数量: ${afterDeleteCount}` };
      } else {
        console.log('✗ 删除用户失败');
        testResults.user.delete = { success: false, message: '删除后用户数量未减少' };
      }
    } else {
      console.log('✗ 未找到删除按钮');
      testResults.user.delete = { success: false, message: '未找到删除按钮' };
    }
    
  } catch (error) {
    console.log('✗ 用户管理测试异常:', error.message);
    await takeScreenshot(page, 'error-user.png');
    testResults.user = { add: { success: false, message: error.message }, 
                       edit: { success: false, message: error.message }, 
                       delete: { success: false, message: error.message } };
  }
}

async function testRoleCRUD(page) {
  console.log('\n========== 角色管理 CRUD 测试 ==========');
  
  try {
    await page.goto(`${BASE_URL}/setting/role`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'role-01-list.png');
    console.log('访问角色管理页面');
    
    const getRoleCount = async () => {
      const rows = await page.$$('tbody tr');
      return rows.length;
    };
    const initialCount = await getRoleCount();
    console.log(`初始角色数量: ${initialCount}`);
    
    // 测试添加角色
    console.log('\n--- 测试添加角色 ---');
    const addButtons = await page.$$('button');
    let addBtnFound = false;
    for (const btn of addButtons) {
      const text = await btn.textContent();
      if (text && (text.includes('新增') || text.includes('添加') || text.includes('新建'))) {
        await btn.click();
        addBtnFound = true;
        break;
      }
    }
    
    if (addBtnFound) {
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'role-02-add-form.png');
      
      const timestamp = Date.now();
      const testRole = {
        name: `测试角色${timestamp}`,
        key: `test_role_${timestamp}`
      };
      
      try {
        await page.fill('input[placeholder="请输入角色名称"]', testRole.name);
      } catch (e) {
        try {
          await page.fill('input[placeholder="请输入角色名"]', testRole.name);
        } catch (e2) {
          console.log('未找到角色名称输入框');
        }
      }
      
      try {
        await page.fill('input[placeholder="请输入角色Key"]', testRole.key);
      } catch (e) {
        console.log('未找到角色Key输入框');
      }
      
      await takeScreenshot(page, 'role-03-form-filled.png');
      
      const confirmButtons = await page.$$('button');
      for (const btn of confirmButtons) {
        const text = await btn.textContent();
        if (text && text.includes('确 定')) {
          await btn.click();
          break;
        }
      }
      
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'role-04-after-add.png');
      
      const finalCount = await getRoleCount();
      if (finalCount > initialCount) {
        console.log('✓ 添加角色成功');
        testResults.role.add = { success: true, message: `角色已添加到列表，当前数量: ${finalCount}` };
      } else {
        console.log('✗ 添加角色失败或角色已存在');
        testResults.role.add = { success: false, message: '添加后角色数量未增加' };
      }
    } else {
      console.log('✗ 未找到新增按钮');
      testResults.role.add = { success: false, message: '未找到新增按钮' };
    }
    
    // 测试编辑角色
    console.log('\n--- 测试编辑角色 ---');
    const editButtons = await page.$$('button');
    let editBtnFound = false;
    for (const btn of editButtons) {
      const text = await btn.textContent();
      if (text && text.includes('编 辑')) {
        await btn.click();
        editBtnFound = true;
        break;
      }
    }
    
    if (editBtnFound) {
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'role-05-edit-form.png');
      
      await takeScreenshot(page, 'role-06-edit-filled.png');
      
      const confirmBtns = await page.$$('button');
      for (const btn of confirmBtns) {
        const text = await btn.textContent();
        if (text && text.includes('确 定')) {
          await btn.click();
          break;
        }
      }
      
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'role-07-after-edit.png');
      console.log('✓ 编辑角色表单已提交');
      testResults.role.edit = { success: true, message: '编辑表单已提交' };
    } else {
      console.log('✗ 未找到编辑按钮');
      testResults.role.edit = { success: false, message: '未找到编辑按钮' };
    }
    
    // 测试删除角色
    console.log('\n--- 测试删除角色 ---');
    const deleteButtons = await page.$$('button');
    let deleteBtnFound = false;
    for (const btn of deleteButtons) {
      const text = await btn.textContent();
      if (text && text.includes('删 除')) {
        await btn.click();
        deleteBtnFound = true;
        break;
      }
    }
    
    if (deleteBtnFound) {
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'role-08-delete-confirm.png');
      
      const confirmDeleteButtons = await page.$$('button');
      for (const btn of confirmDeleteButtons) {
        const text = await btn.textContent();
        if (text && (text.includes('确 定') || text.includes('确认') || text.includes('删除'))) {
          await btn.click();
          break;
        }
      }
      
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'role-09-after-delete.png');
      
      const afterDeleteCount = await getRoleCount();
      if (afterDeleteCount < finalCount) {
        console.log('✓ 删除角色成功');
        testResults.role.delete = { success: true, message: `角色已删除，当前数量: ${afterDeleteCount}` };
      } else {
        console.log('✗ 删除角色失败');
        testResults.role.delete = { success: false, message: '删除后角色数量未减少' };
      }
    } else {
      console.log('✗ 未找到删除按钮');
      testResults.role.delete = { success: false, message: '未找到删除按钮' };
    }
    
  } catch (error) {
    console.log('✗ 角色管理测试异常:', error.message);
    await takeScreenshot(page, 'error-role.png');
    testResults.role = { add: { success: false, message: error.message }, 
                       edit: { success: false, message: error.message }, 
                       delete: { success: false, message: error.message } };
  }
}

async function testMenuCRUD(page) {
  console.log('\n========== 菜单管理 CRUD 测试 ==========');
  
  try {
    await page.goto(`${BASE_URL}/setting/menu`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'menu-01-list.png');
    console.log('访问菜单管理页面');
    
    const getMenuCount = async () => {
      // 尝试获取菜单项数量
      const items = await page.$$('[class*="menu"], [class*="tree"], tbody tr, .el-tree-node');
      return items.length;
    };
    const initialCount = await getMenuCount();
    console.log(`初始菜单数量: ${initialCount}`);
    
    // 测试添加菜单
    console.log('\n--- 测试添加菜单 ---');
    const addButtons = await page.$$('button');
    let addBtnFound = false;
    for (const btn of addButtons) {
      const text = await btn.textContent();
      if (text && (text.includes('新增') || text.includes('添加') || text.includes('新建'))) {
        await btn.click();
        addBtnFound = true;
        break;
      }
    }
    
    if (addBtnFound) {
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'menu-02-add-form.png');
      
      const timestamp = Date.now();
      const testMenu = {
        name: `测试菜单${timestamp}`,
        path: `/test/${timestamp}`,
        component: 'test/index'
      };
      
      try {
        await page.fill('input[placeholder="请输入菜单名称"]', testMenu.name);
      } catch (e) {
        try {
          await page.fill('input[placeholder="请输入菜单名"]', testMenu.name);
        } catch (e2) {
          console.log('未找到菜单名称输入框');
        }
      }
      
      try {
        await page.fill('input[placeholder="请输入路由地址"]', testMenu.path);
      } catch (e) {
        console.log('未找到路由地址输入框');
      }
      
      await takeScreenshot(page, 'menu-03-form-filled.png');
      
      const confirmButtons = await page.$$('button');
      for (const btn of confirmButtons) {
        const text = await btn.textContent();
        if (text && text.includes('确 定')) {
          await btn.click();
          break;
        }
      }
      
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'menu-04-after-add.png');
      
      const finalCount = await getMenuCount();
      if (finalCount > initialCount) {
        console.log('✓ 添加菜单成功');
        testResults.menu.add = { success: true, message: `菜单已添加到列表，当前数量: ${finalCount}` };
      } else {
        console.log('✗ 添加菜单失败或菜单已存在');
        testResults.menu.add = { success: false, message: '添加后菜单数量未增加' };
      }
    } else {
      console.log('✗ 未找到新增按钮');
      testResults.menu.add = { success: false, message: '未找到新增按钮' };
    }
    
    // 测试编辑菜单
    console.log('\n--- 测试编辑菜单 ---');
    const editButtons = await page.$$('button');
    let editBtnFound = false;
    for (const btn of editButtons) {
      const text = await btn.textContent();
      if (text && text.includes('编 辑')) {
        await btn.click();
        editBtnFound = true;
        break;
      }
    }
    
    if (editBtnFound) {
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'menu-05-edit-form.png');
      
      await takeScreenshot(page, 'menu-06-edit-filled.png');
      
      const confirmBtns = await page.$$('button');
      for (const btn of confirmBtns) {
        const text = await btn.textContent();
        if (text && text.includes('确 定')) {
          await btn.click();
          break;
        }
      }
      
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'menu-07-after-edit.png');
      console.log('✓ 编辑菜单表单已提交');
      testResults.menu.edit = { success: true, message: '编辑表单已提交' };
    } else {
      console.log('✗ 未找到编辑按钮');
      testResults.menu.edit = { success: false, message: '未找到编辑按钮' };
    }
    
    // 测试删除菜单
    console.log('\n--- 测试删除菜单 ---');
    const deleteButtons = await page.$$('button');
    let deleteBtnFound = false;
    for (const btn of deleteButtons) {
      const text = await btn.textContent();
      if (text && text.includes('删 除')) {
        await btn.click();
        deleteBtnFound = true;
        break;
      }
    }
    
    if (deleteBtnFound) {
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'menu-08-delete-confirm.png');
      
      const confirmDeleteButtons = await page.$$('button');
      for (const btn of confirmDeleteButtons) {
        const text = await btn.textContent();
        if (text && (text.includes('确 定') || text.includes('确认') || text.includes('删除'))) {
          await btn.click();
          break;
        }
      }
      
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'menu-09-after-delete.png');
      
      const afterDeleteCount = await getMenuCount();
      if (afterDeleteCount < finalCount) {
        console.log('✓ 删除菜单成功');
        testResults.menu.delete = { success: true, message: `菜单已删除，当前数量: ${afterDeleteCount}` };
      } else {
        console.log('✗ 删除菜单失败');
        testResults.menu.delete = { success: false, message: '删除后菜单数量未减少' };
      }
    } else {
      console.log('✗ 未找到删除按钮');
      testResults.menu.delete = { success: false, message: '未找到删除按钮' };
    }
    
  } catch (error) {
    console.log('✗ 菜单管理测试异常:', error.message);
    await takeScreenshot(page, 'error-menu.png');
    testResults.menu = { add: { success: false, message: error.message }, 
                       edit: { success: false, message: error.message }, 
                       delete: { success: false, message: error.message } };
  }
}

function generateReport() {
  const now = new Date().toISOString();
  let report = `# CRUD 测试报告

生成时间: ${now}

---

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

### 用户管理

- **添加用户**: ${testResults.user.add?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.user.add?.message || '无'}
  
- **编辑用户**: ${testResults.user.edit?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.user.edit?.message || '无'}
  
- **删除用户**: ${testResults.user.delete?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.user.delete?.message || '无'}

### 角色管理

- **添加角色**: ${testResults.role.add?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.role.add?.message || '无'}
  
- **编辑角色**: ${testResults.role.edit?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.role.edit?.message || '无'}
  
- **删除角色**: ${testResults.role.delete?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.role.delete?.message || '无'}

### 菜单管理

- **添加菜单**: ${testResults.menu.add?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.menu.add?.message || '无'}
  
- **编辑菜单**: ${testResults.menu.edit?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.menu.edit?.message || '无'}
  
- **删除菜单**: ${testResults.menu.delete?.success ? '✓ 成功' : '✗ 失败'}
  - ${testResults.menu.delete?.message || '无'}

---

## 截图列表

### 登录
- 01-login-page.png - 登录页面
- 02-login-filled.png - 登录信息已填写
- 03-login-success.png - 登录成功

### 用户管理
- user-01-list.png - 用户列表
- user-02-add-form.png - 添加用户表单
- user-03-form-filled.png - 表单已填写
- user-04-after-add.png - 添加后
- user-05-edit-form.png - 编辑表单
- user-06-edit-filled.png - 编辑表单已填写
- user-07-after-edit.png - 编辑后
- user-08-delete-confirm.png - 删除确认
- user-09-after-delete.png - 删除后

### 角色管理
- role-01-list.png - 角色列表
- role-02-add-form.png - 添加角色表单
- role-03-form-filled.png - 表单已填写
- role-04-after-add.png - 添加后
- role-05-edit-form.png - 编辑表单
- role-06-edit-filled.png - 编辑表单已填写
- role-07-after-edit.png - 编辑后
- role-08-delete-confirm.png - 删除确认
- role-09-after-delete.png - 删除后

### 菜单管理
- menu-01-list.png - 菜单列表
- menu-02-add-form.png - 添加菜单表单
- menu-03-form-filled.png - 表单已填写
- menu-04-after-add.png - 添加后
- menu-05-edit-form.png - 编辑表单
- menu-06-edit-filled.png - 编辑表单已填写
- menu-07-after-edit.png - 编辑后
- menu-08-delete-confirm.png - 删除确认
- menu-09-after-delete.png - 删除后

---

## 测试结论

${(testResults.user.add?.success && testResults.user.edit?.success && testResults.user.delete?.success && testResults.role.add?.success && testResults.role.edit?.success && testResults.role.delete?.success && testResults.menu.add?.success && testResults.menu.edit?.success && testResults.menu.delete?.success) ? '✓ 所有测试通过' : '部分测试失败，请检查详情'}
`;

  return report;
}

async function main() {
  console.log('开始 CRUD 测试...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // 登录
    const loginSuccess = await login(page);
    if (!loginSuccess) {
      console.log('登录失败，终止测试');
      return;
    }
    
    // 用户管理 CRUD
    await testUserCRUD(page);
    
    // 角色管理 CRUD
    await testRoleCRUD(page);
    
    // 菜单管理 CRUD
    await testMenuCRUD(page);
    
    // 生成报告
    const report = generateReport();
    console.log('\n========== 测试报告 ==========');
    console.log(report);
    
    // 保存报告
    const fs = require('fs');
    fs.writeFileSync(`${screenshotDir}/crud-test-report.md`, report);
    console.log(`\n报告已保存到: ${screenshotDir}/crud-test-report.md`);
    
  } catch (error) {
    console.error('测试过程出错:', error);
    await takeScreenshot(page, 'error-final.png');
  } finally {
    console.log('\n测试完成，5秒后关闭浏览器...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

main();
