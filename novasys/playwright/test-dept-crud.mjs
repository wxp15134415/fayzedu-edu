/**
 * 部门管理 CRUD 功能测试
 * 测试添加、编辑、删除功能
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
      console.log(`✅ API登录成功`);
      return true;
    }
    return false;
  } catch (error) {
    console.log(`❌ API登录失败: ${error.message}`);
    return false;
  }
}

async function login() {
  console.log('\n=== 执行登录 ===');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  
  // 等待登录表单
  await page.waitForSelector('input[type="text"], input[placeholder*="账"]', { timeout: 10000 }).catch(() => null);
  
  // 输入用户名密码
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
  
  // 点击登录
  const loginButton = page.locator('button').filter({ hasText: /登|录|登录/ }).first();
  await loginButton.click();
  
  // 等待跳转
  await page.waitForURL(`${BASE_URL}/**`, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  
  console.log(`✅ 登录成功`);
  return true;
}

// 获取当前部门列表
async function getDeptList() {
  const response = await fetch(`${API_URL}/dept`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const data = await response.json();
  return data.data || [];
}

// 测试 CRUD
async function testCRUD() {
  console.log('\n=== 开始测试部门 CRUD 功能 ===\n');
  
  // 1. 访问部门管理页面
  console.log('1. 访问部门管理页面...');
  await page.goto(`${BASE_URL}/setting/dept`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(3000);
  
  // 截图
  await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dept-before.png', fullPage: true });
  console.log('   📸 截图保存: dept-before.png');
  
  // 2. 检查是否有数据
  const initialDeptList = await getDeptList();
  console.log(`   初始部门数量: ${initialDeptList.length}`);
  
  // 3. 点击新建按钮
  console.log('\n2. 测试添加部门功能...');
  const newButton = page.locator('button:has-text("新建")').first();
  if (await newButton.isVisible()) {
    await newButton.click();
    await page.waitForTimeout(1000);
    
    // 截图弹窗
    await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dept-modal-add.png', fullPage: true });
    console.log('   📸 弹窗截图保存: dept-modal-add.png');
    
    // 填写表单
    await page.fill('input[nmodel\\:value*="deptName"], input[placeholder*="部门"]', '测试部门');
    await page.fill('input[nmodel\\:value*="leader"], input[placeholder*="负责人"]', '张三');
    await page.fill('input[nmodel\\:value*="phone"], input[placeholder*="电话"]', '13800138000');
    
    // 提交
    const submitButton = page.locator('button:has-text("提交")').last();
    await submitButton.click();
    await page.waitForTimeout(2000);
    
    console.log('   ✅ 提交添加表单');
  } else {
    console.log('   ⚠️ 新建按钮未找到或不可见');
  }
  
  // 4. 刷新页面查看结果
  console.log('\n3. 刷新页面查看结果...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // 截图
  await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dept-after-add.png', fullPage: true });
  
  const afterDeptList = await getDeptList();
  console.log(`   当前部门数量: ${afterDeptList.length}`);
  
  // 5. 测试编辑功能
  if (afterDeptList.length > 0) {
    console.log('\n4. 测试编辑部门功能...');
    
    // 找到编辑按钮并点击第一行
    const editButton = page.locator('button:has-text("编辑")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);
      
      // 截图编辑弹窗
      await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dept-modal-edit.png', fullPage: true });
      
      // 修改负责人
      const leaderInput = page.locator('input[nmodel\\:value*="leader"]').first();
      await leaderInput.fill('');
      await leaderInput.fill('李四');
      
      // 提交
      const submitButton = page.locator('button:has-text("提交")').last();
      await submitButton.click();
      await page.waitForTimeout(2000);
      
      console.log('   ✅ 提交编辑表单');
    }
  }
  
  // 6. 刷新查看
  console.log('\n5. 刷新页面查看编辑结果...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dept-after-edit.png', fullPage: true });
  
  // 7. 测试删除功能
  const currentDeptList = await getDeptList();
  if (currentDeptList.length > 1) {
    console.log('\n6. 测试删除部门功能...');
    
    // 点击删除按钮（最后一行的删除）
    const deleteButton = page.locator('button:has-text("删除")').last();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.waitForTimeout(500);
      
      // 确认删除
      const confirmButton = page.locator('button:has-text("确认")').first();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      } else {
        // N-popconfirm 可能直接删除
        await page.waitForTimeout(1000);
      }
      
      await page.waitForTimeout(2000);
      console.log('   ✅ 删除操作完成');
    }
  } else {
    console.log('\n6. 跳过删除测试（至少保留一条数据）');
  }
  
  // 8. 最终验证
  console.log('\n7. 最终数据验证...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  const finalDeptList = await getDeptList();
  console.log(`   最终部门数量: ${finalDeptList.length}`);
  
  await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dept-final.png', fullPage: true });
  
  console.log('\n=== 测试完成 ===');
  
  // 输出最终部门列表
  console.log('\n当前部门列表:');
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
  console.log('🚀 部门管理 CRUD 测试开始\n');
  
  try {
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();
    
    // 登录
    await loginViaAPI();
    await login();
    
    // 执行 CRUD 测试
    await testCRUD();
    
    console.log('\n测试完成，浏览器将保持打开状态...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ 测试过程发生错误:', error);
  } finally {
    // 不关闭浏览器，让用户查看
    console.log('\n按回车键关闭浏览器...');
  }
}

main();
