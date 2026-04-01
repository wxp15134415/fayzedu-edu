/**
 * 部门管理 CRUD 功能测试 - 调试版本
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
  
  console.log('1. 访问部门管理页面...');
  await page.goto(`${BASE_URL}/setting/dept`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(3000);
  
  // 打印页面内容摘要
  const pageContent = await page.content();
  console.log(`   页面内容长度: ${pageContent.length} 字符`);
  
  // 查找所有按钮
  const buttons = await page.locator('button').all();
  console.log(`   页面按钮数量: ${buttons.length}`);
  
  for (let i = 0; i < Math.min(buttons.length, 10); i++) {
    const text = await buttons[i].textContent();
    console.log(`   按钮 ${i + 1}: "${text?.trim()}"`);
  }
  
  // 尝试查找包含"新建"的按钮
  console.log('\n2. 尝试点击新建按钮...');
  
  // 使用更精确的定位器
  const newButtons = page.locator('button:has-text("新建")');
  const count = await newButtons.count();
  console.log(`   找到 "新建" 按钮数量: ${count}`);
  
  if (count > 0) {
    console.log('   尝试点击第一个新建按钮...');
    try {
      await newButtons.first().click({ timeout: 5000 });
      await page.waitForTimeout(2000);
      
      // 检查是否有弹窗出现
      const modal = page.locator('.n-modal, [class*="modal"], [role="dialog"]');
      const modalCount = await modal.count();
      console.log(`   弹窗数量: ${modalCount}`);
      
      if (modalCount > 0) {
        console.log('   ✅ 弹窗已打开');
        await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dept-modal-open.png', fullPage: true });
        
        // 填写表单 - 尝试多种选择器
        const deptNameInputs = page.locator('input').all();
        console.log(`   输入框数量: ${deptNameInputs.length}`);
        
        // 找到第一个输入框并填写
        if (deptNameInputs.length > 0) {
          await deptNameInputs[0].fill('测试部门');
          console.log('   ✅ 填写部门名称');
        }
        
        // 提交
        const submitBtns = page.locator('button:has-text("提交")');
        const submitCount = await submitBtns.count();
        console.log(`   提交按钮数量: ${submitCount}`);
        
        if (submitCount > 0) {
          await submitBtns.last().click();
          await page.waitForTimeout(2000);
          console.log('   ✅ 已提交表单');
        }
      }
    } catch (e) {
      console.log(`   ❌ 点击失败: ${e.message}`);
    }
  } else {
    // 打印实际按钮内容帮助调试
    console.log('   ⚠️ 未找到新建按钮，打印所有按钮:');
    for (let i = 0; i < buttons.length; i++) {
      const btnText = await buttons[i].textContent();
      const btnHtml = await buttons[i].evaluate(el => el.outerHTML.substring(0, 200));
      console.log(`   按钮 ${i + 1}: ${btnText?.trim()}`);
      console.log(`     HTML: ${btnHtml}`);
    }
  }
  
  // 刷新页面查看结果
  console.log('\n3. 刷新页面查看结果...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  const finalDeptList = await getDeptList();
  console.log(`   当前部门数量: ${finalDeptList.length}`);
  
  await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/dept-result.png', fullPage: true });
  
  console.log('\n=== 测试完成 ===');
  console.log('\n最终部门列表:');
  finalDeptList.forEach(dept => {
    console.log(`  - ID: ${dept.id}, 名称: ${dept.deptName}, 负责人: ${dept.leader || '-'}`);
  });
  
  if (finalDeptList.length >= 1) {
    console.log('\n✅ 验证通过: 表格至少有1条数据');
  }
}

async function main() {
  console.log('🚀 部门管理 CRUD 测试开始\n');
  
  try {
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();
    
    await loginViaAPI();
    await login();
    await testCRUD();
    
    console.log('\n按回车键关闭浏览器...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('\n❌ 测试过程发生错误:', error);
  } finally {
    await browser.close();
  }
}

main();
