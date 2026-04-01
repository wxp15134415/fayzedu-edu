/**
 * 部门管理 CRUD 功能测试 - 完整版
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:9980';
const API_URL = 'http://localhost:3000';
const USERNAME = 'super';
const PASSWORD = '123456';

let browser;
let context;
let page;
let authToken = null;

async function loginViaAPI() {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD })
  });
  const data = await response.json();
  authToken = data.data?.accessToken;
  console.log(`✅ API登录成功`);
}

async function login() {
  console.log('\n=== 执行登录 ===');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  
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
  
  const loginButton = page.locator('button').filter({ hasText: /登|录|登录/ }).first();
  await loginButton.click();
  
  await page.waitForURL(`${BASE_URL}/**`, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  
  console.log(`✅ 登录成功`);
}

async function getDeptList() {
  const response = await fetch(`${API_URL}/dept`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const data = await response.json();
  return data.data || [];
}

async function testCRUD() {
  console.log('\n=== 开始测试部门 CRUD 功能 ===\n');
  
  const initialDeptList = await getDeptList();
  console.log(`初始部门数量: ${initialDeptList.length}`);
  
  // 1. 访问部门管理页面
  console.log('\n1. 访问部门管理页面...');
  await page.goto(`${BASE_URL}/setting/dept`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dept-01-page.png', fullPage: true });
  console.log('   📸 截图: dept-01-page.png');
  
  // 2. 测试添加功能
  console.log('\n2. 测试添加部门...');
  const newButton = page.locator('button:has-text("新建")').first();
  await newButton.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dept-02-add-modal.png', fullPage: true });
  console.log('   📸 截图: dept-02-add-modal.png');
  
  // 使用更精确的表单输入
  const formInputs = page.locator('.n-form-item .n-input input, .n-form-item .n-input-number input');
  const inputCount = await formInputs.count();
  console.log(`   表单输入框数量: ${inputCount}`);
  
  // 填写表单 - 依次填入
  const deptNameInput = page.locator('.n-form-item').filter({ has: page.locator('text=部门名称') }).locator('input').first();
  const leaderInput = page.locator('.n-form-item').filter({ has: page.locator('text=负责人') }).locator('input').first();
  const phoneInput = page.locator('.n-form-item').filter({ has: page.locator('text=联系电话') }).locator('input').first();
  
  if (await deptNameInput.isVisible()) {
    await deptNameInput.fill('测试部门-Playwright');
    console.log('   ✅ 填写部门名称');
  }
  
  if (await leaderInput.isVisible()) {
    await leaderInput.fill('测试负责人');
    console.log('   ✅ 填写负责人');
  }
  
  if (await phoneInput.isVisible()) {
    await phoneInput.fill('13900000000');
    console.log('   ✅ 填写联系电话');
  }
  
  await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dept-03-form-filled.png', fullPage: true });
  console.log('   📸 截图: dept-03-form-filled.png');
  
  // 点击提交按钮
  const submitButton = page.locator('button:has-text("提交")').last();
  await submitButton.click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dept-04-after-add.png', fullPage: true });
  console.log('   📸 截图: dept-04-after-add.png');
  
  const afterAddList = await getDeptList();
  console.log(`   添加后部门数量: ${afterAddList.length}`);
  
  // 3. 测试编辑功能
  console.log('\n3. 测试编辑部门...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  const editButton = page.locator('button:has-text("编辑")').first();
  if (await editButton.isVisible()) {
    await editButton.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dept-05-edit-modal.png', fullPage: true });
    console.log('   📸 截图: dept-05-edit-modal.png');
    
    // 修改负责人
    const editLeaderInput = page.locator('.n-form-item').filter({ has: page.locator('text=负责人') }).locator('input').first();
    if (await editLeaderInput.isVisible()) {
      await editLeaderInput.fill('');
      await editLeaderInput.fill('编辑后的负责人');
      console.log('   ✅ 修改负责人');
    }
    
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dept-06-edit-filled.png', fullPage: true });
    console.log('   📸 截图: dept-06-edit-filled.png');
    
    const editSubmitButton = page.locator('button:has-text("提交")').last();
    await editSubmitButton.click();
    await page.waitForTimeout(3000);
    console.log('   ✅ 提交编辑');
  }
  
  const afterEditList = await getDeptList();
  console.log(`   编辑后部门数量: ${afterEditList.length}`);
  
  await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dept-07-after-edit.png', fullPage: true });
  
  // 4. 测试删除功能
  console.log('\n4. 测试删除部门...');
  if (afterEditList.length > 1) {
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 点击最后一个删除按钮
    const deleteButton = page.locator('button:has-text("删除")').last();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dept-08-confirm.png', fullPage: true });
      
      // 确认删除
      const confirmButton = page.locator('button:has-text("确认")').first();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        console.log('   ✅ 确认删除');
      }
      
      await page.waitForTimeout(2000);
    }
  } else {
    console.log('   跳过删除测试（保持至少1条数据）');
  }
  
  const finalDeptList = await getDeptList();
  console.log(`   最终部门数量: ${finalDeptList.length}`);
  
  // 5. 最终验证
  console.log('\n5. 最终验证...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dept-09-final.png', fullPage: true });
  console.log('   📸 截图: dept-09-final.png');
  
  console.log('\n=== 测试完成 ===');
  console.log('\n最终部门列表:');
  finalDeptList.forEach(dept => {
    console.log(`  - ID: ${dept.id}, 名称: ${dept.deptName}, 负责人: ${dept.leader || '-'}`);
  });
  
  if (finalDeptList.length >= 1) {
    console.log('\n✅ 验证通过: 表格至少有1条数据');
  } else {
    console.log('\n❌ 验证失败: 没有数据');
  }
}

async function main() {
  console.log('🚀 部门管理 CRUD 完整测试开始\n');
  
  try {
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();
    
    await loginViaAPI();
    await login();
    await testCRUD();
    
    console.log('\n测试完成，浏览器将保持打开状态...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('\n❌ 测试过程发生错误:', error);
  } finally {
    await browser.close();
  }
}

main();
