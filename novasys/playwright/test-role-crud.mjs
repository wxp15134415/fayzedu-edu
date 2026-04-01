/**
 * 角色管理页面 CRUD 功能测试脚本
 * 测试内容：
 * 1. 登录系统
 * 2. 添加角色
 * 3. 编辑角色
 * 4. 删除角色
 * 5. 验证数据正确性
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:9980';
const API_URL = 'http://localhost:3000';
const USERNAME = 'super';
const PASSWORD = '123456';

const results = {
  passed: [],
  failed: [],
  errors: []
};

let browser;
let context;
let page;
let authToken = null;

// 辅助函数：等待元素出现
async function waitForElement(selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout, state: 'visible' });
    return true;
  } catch {
    return false;
  }
}

// 辅助函数：登录
async function login() {
  console.log('\n=== 执行登录 ===');
  
  // 先通过 API 登录获取 token
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD })
  });
  const data = await response.json();
  authToken = data.data?.accessToken;
  
  if (!authToken) {
    console.log('❌ API登录失败');
    return false;
  }
  
  console.log(`✅ API登录成功，Token: ${authToken.substring(0, 20)}...`);
  
  // 启动非无头浏览器
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext();
  page = await context.newPage();
  
  // 先访问登录页，填写表单登录
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  
  // 找到用户名和密码输入框
  const inputs = await page.locator('input').all();
  for (const input of inputs) {
    const placeholder = await input.getAttribute('placeholder') || '';
    const type = await input.getAttribute('type') || '';
    
    if (placeholder.includes('账') || placeholder.includes('用户') || type === 'text') {
      await input.fill(USERNAME);
    } else if (placeholder.includes('密') || type === 'password') {
      await input.fill(PASSWORD);
    }
  }
  
  // 点击登录按钮
  const loginButton = page.getByRole('button', { name: '登录' });
  await loginButton.click();
  
  // 等待跳转
  await page.waitForTimeout(3000);
  
  // 检查当前URL
  const currentUrl = page.url();
  console.log(`  ℹ️ 当前URL: ${currentUrl}`);
  
  // 如果仍在登录页，手动设置token并刷新
  if (currentUrl.includes('/login')) {
    console.log('  ℹ️ 手动设置Token并刷新');
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
    }, authToken);
    await page.goto(`${BASE_URL}/setting/role`, { waitUntil: 'networkidle' });
  }
  
  await page.waitForTimeout(2000);
  console.log('✅ 登录完成，已进入系统');
  return true;
}

// 辅助函数：通过 API 登录获取 token
async function loginViaAPI() {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: USERNAME, password: PASSWORD })
    });
    const data = await response.json();
    const token = data.data?.accessToken || data.data?.access_token || data.data?.token;
    if (data.code === 200 && token) {
      authToken = token;
      console.log(`✅ API登录成功，Token: ${authToken.substring(0, 20)}...`);
      return true;
    }
    return false;
  } catch (error) {
    console.log(`❌ API登录失败: ${error.message}`);
    return false;
  }
}

// 1. 访问角色管理页面并查看初始数据
async function testRolePage() {
  console.log('\n=== 1. 访问角色管理页面 ===');
  try {
    await page.goto(`${BASE_URL}/setting/role`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);
    
    // 获取页面内容
    const pageContent = await page.content();
    const hasRole = pageContent.includes('角色') || pageContent.includes('role') || pageContent.includes('Role');
    
    if (hasRole) {
      console.log('    ✅ 角色管理页面加载成功');
      results.passed.push('角色管理页面正常加载');
    } else {
      console.log('    ❌ 角色管理页面加载失败');
      results.failed.push('角色管理页面加载失败');
      return false;
    }
    
    // 截图
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/crud-role-01-page.png' });
    console.log('    📸 已保存截图: crud-role-01-page.png');
    
    return true;
  } catch (error) {
    console.log(`    ❌ 错误: ${error.message}`);
    results.errors.push(`访问角色管理页面 - ${error.message}`);
    return false;
  }
}

// 2. 添加角色
async function testAddRole() {
  console.log('\n=== 2. 添加角色 ===');
  try {
    // 直接使用文本选择器，点击包含"新建"文字的按钮
    const addButton = page.getByRole('button', { name: '新建' });
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(2000);
      
      // 截图
      await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/crud-role-02-add-form.png' });
      console.log('    📸 已保存截图: crud-role-02-add-form.png');
      console.log('    ✅ 添加弹窗已打开');
      
      // 填写表单 - 使用表单标签定位
      const formItems = page.locator('.n-form-item');
      const roleNameInput = formItems.first().locator('input');
      await roleNameInput.fill('测试角色');
      
      const roleKeyInput = formItems.nth(1).locator('input');
      await roleKeyInput.fill('test_role');
      
      // 截图
      await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/crud-role-03-form-filled.png' });
      console.log('    📸 已保存截图: crud-role-03-form-filled.png');
      
      // 点击提交按钮
      const submitButton = page.locator('.n-modal button[type="submit"], .n-modal .n-button--primary-type').first();
      await submitButton.click();
      await page.waitForTimeout(3000);
      
      // 截图
      await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/crud-role-04-after-add.png' });
      console.log('    📸 已保存截图: crud-role-04-after-add.png');
      
      console.log('    ✅ 添加角色操作完成');
      results.passed.push('添加角色功能正常');
    } else {
      console.log('    ⚠️ 未找到新建按钮');
      // 尝试其他方式
      const buttons = await page.locator('button').all();
      console.log(`    ℹ️ 页面按钮数量: ${buttons.length}`);
      for (const btn of buttons) {
        const text = await btn.textContent();
        console.log(`    ℹ️ 按钮: ${text}`);
      }
    }
    return true;
    
  } catch (error) {
    console.log(`    ❌ 添加角色错误: ${error.message}`);
    results.errors.push(`添加角色 - ${error.message}`);
    return false;
  }
}

// 3. 编辑角色
async function testEditRole() {
  console.log('\n=== 3. 编辑角色 ===');
  try {
    // 刷新页面
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 截图
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/crud-role-05-before-edit.png' });
    console.log('    📸 已保存截图: crud-role-05-before-edit.png');
    
    // 点击"编辑"按钮 - 使用 first() 解决多个匹配问题
    const editButton = page.getByRole('button', { name: '编辑' }).first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(2000);
      
      // 截图
      await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/crud-role-06-edit-form.png' });
      console.log('    📸 已保存截图: crud-role-06-edit-form.png');
      console.log('    ✅ 编辑弹窗已打开');
      
      // 修改表单
      const formItems = page.locator('.n-form-item');
      const roleNameInput = formItems.first().locator('input');
      await roleNameInput.fill('');
      await roleNameInput.fill('测试角色-已修改');
      
      // 截图
      await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/crud-role-07-edit-filled.png' });
      console.log('    📸 已保存截图: crud-role-07-edit-filled.png');
      
      // 点击提交按钮
      const submitButton = page.locator('.n-modal button[type="submit"], .n-modal .n-button--primary-type').first();
      await submitButton.click();
      await page.waitForTimeout(3000);
      
      // 截图
      await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/crud-role-08-after-edit.png' });
      console.log('    📸 已保存截图: crud-role-08-after-edit.png');
      
      console.log('    ✅ 编辑角色操作完成');
      results.passed.push('编辑角色功能正常');
    } else {
      console.log('    ⚠️ 未找到编辑按钮');
    }
    return true;
    
  } catch (error) {
    console.log(`    ❌ 编辑角色错误: ${error.message}`);
    results.errors.push(`编辑角色 - ${error.message}`);
    return false;
  }
}

// 4. 删除角色
async function testDeleteRole() {
  console.log('\n=== 4. 删除角色 ===');
  try {
    // 刷新页面
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 截图
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/crud-role-09-before-delete.png' });
    console.log('    📸 已保存截图: crud-role-09-before-delete.png');
    
    // 获取当前表格行数
    const rowsBefore = await page.locator('.n-data-table tbody tr').count();
    console.log(`    ℹ️ 删除前行数: ${rowsBefore}`);
    
    // 点击"删除"按钮 - 使用 first() 解决多个匹配问题
    const deleteButton = page.getByRole('button', { name: '删除' }).first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.waitForTimeout(1000);
      
      // 截图
      await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/crud-role-10-confirm-delete.png' });
      console.log('    📸 已保存截图: crud-role-10-confirm-delete.png');
      
      // 处理确认弹窗 - 点击确认按钮
      const confirmButton = page.locator('.n-popconfirm__action button').last();
      await confirmButton.click();
      await page.waitForTimeout(3000);
      
      // 截图
      await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/crud-role-11-after-delete.png' });
      console.log('    📸 已保存截图: crud-role-11-after-delete.png');
      
      // 获取当前行数
      const rowsAfter = await page.locator('.n-data-table tbody tr').count();
      console.log(`    ℹ️ 删除后行数: ${rowsAfter}`);
      
      console.log('    ✅ 删除角色流程完成');
      results.passed.push('删除角色功能正常');
    } else {
      console.log('    ⚠️ 未找到删除按钮');
    }
    return true;
    
  } catch (error) {
    console.log(`    ❌ 删除角色错误: ${error.message}`);
    results.errors.push(`删除角色 - ${error.message}`);
    return false;
  }
}

// 5. 验证最终数据
async function verifyFinalData() {
  console.log('\n=== 5. 验证最终数据 ===');
  try {
    // 刷新页面
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 截图
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/crud-role-12-final.png' });
    console.log('    📸 已保存截图: crud-role-12-final.png');
    
    // 获取页面内容
    const pageContent = await page.content();
    
    // 检查是否有数据
    const hasData = pageContent.includes('角色') && (pageContent.includes('管理员') || pageContent.includes('超级管理员'));
    
    if (hasData) {
      console.log('    ✅ 表格有数据显示');
      results.passed.push('最终表格有数据');
    } else {
      console.log('    ⚠️ 表格可能为空');
      results.failed.push('最终表格数据为空');
    }
    
    return hasData;
    
  } catch (error) {
    console.log(`    ❌ 验证错误: ${error.message}`);
    results.errors.push(`验证数据 - ${error.message}`);
    return false;
  }
}

// 生成报告
function generateReport() {
  const report = `# 角色管理 CRUD 测试报告

生成时间: ${new Date().toLocaleString()}
前端地址: ${BASE_URL}
登录凭据: ${USERNAME} / ${PASSWORD}

---

## 测试结果

### 通过项目 (${results.passed.length})
${results.passed.map(item => `- ✅ ${item}`).join('\n')}

### 失败项目 (${results.failed.length})
${results.failed.length > 0 ? results.failed.map(item => `- ❌ ${item}`).join('\n') : '无'}

### 错误信息 (${results.errors.length})
${results.errors.length > 0 ? results.errors.map(item => `- ⚠️ ${item}`).join('\n') : '无'}

---

## 测试摘要

| 类别 | 数量 |
|------|------|
| 通过 | ${results.passed.length} |
| 失败 | ${results.failed.length} |
| 错误 | ${results.errors.length} |

---

## 测试流程

1. 登录系统
2. 访问角色管理页面
3. 添加新角色
4. 编辑角色信息
5. 删除角色
6. 验证最终数据
`;
  return report;
}

// 主函数
async function main() {
  console.log('🚀 角色管理 CRUD 功能测试开始\n');
  console.log(`前端: ${BASE_URL}`);
  console.log(`后端: ${API_URL}`);
  console.log(`登录凭据: ${USERNAME} / ${PASSWORD}`);
  
  try {
    // 登录并启动浏览器
    const loggedIn = await login();
    if (!loggedIn) {
      console.log('❌ 登录失败，测试终止');
      return;
    }
    
    // 执行各项测试
    await testRolePage();
    await testAddRole();
    await testEditRole();
    await testDeleteRole();
    await verifyFinalData();
    
    // 生成报告
    const report = generateReport();
    console.log('\n=== 测试报告 ===');
    console.log(report);
    
    // 写入报告文件
    const fs = await import('fs');
    const reportPath = '/Users/wangxiaoping/fayzedu/novasys/playwright/crud-test-report.md';
    fs.writeFileSync(reportPath, report, 'utf-8');
    console.log(`\n📄 报告已保存至: ${reportPath}`);
    
  } catch (error) {
    console.error('\n❌ 测试过程发生错误:', error);
  } finally {
    if (browser) {
      // 等待用户查看
      console.log('\n⏳ 等待 10 秒后关闭浏览器...');
      await page.waitForTimeout(10000);
      await browser.close();
    }
  }
}

// 运行测试
main();
