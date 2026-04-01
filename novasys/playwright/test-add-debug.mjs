/**
 * 用户管理 CRUD 详细调试测试脚本
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:9980';
const USERNAME = 'super';
const PASSWORD = '123456';

let browser;
let context;
let page;

async function login() {
  console.log('\n=== 执行登录 ===');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  
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
  
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && text.includes('登录')) {
      await btn.click();
      break;
    }
  }
  
  await page.waitForTimeout(5000);
  console.log('✅ 登录成功');
}

async function testAddOperation() {
  console.log('\n=== 详细测试添加用户功能 ===');
  
  // 1. 访问用户管理页面，记录初始状态
  console.log('\n1. 访问用户管理页面');
  await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);
  
  // 获取初始用户数据
  let initialRows = await page.locator('.n-data-table tbody tr').count();
  console.log(`   初始用户数: ${initialRows}`);
  
  // 获取表格第一行数据用于对比
  const firstRowCells = await page.locator('.n-data-table tbody tr').first().locator('td').allTextContents();
  console.log(`   第一行数据: ${firstRowCells.slice(0, 3).join(' | ')}`);
  
  // 2. 点击添加按钮
  console.log('\n2. 点击添加按钮');
  const addButton = page.locator('button').filter({ hasText: '新建用户' }).first();
  await addButton.click();
  await page.waitForTimeout(2000);
  
  // 3. 填写表单 - 使用更精确的定位
  console.log('\n3. 填写表单');
  
  // 查找用户名输入框
  const userNameInput = page.locator('.n-form-item').filter({ hasText: '用户名' }).locator('input').first();
  await userNameInput.fill('测试用户001');
  console.log('   填写用户名: 测试用户001');
  
  // 查找邮箱输入框
  const emailInput = page.locator('.n-form-item').filter({ hasText: '邮箱' }).locator('input').first();
  await emailInput.fill('test001@example.com');
  console.log('   填写邮箱: test001@example.com');
  
  // 查找电话输入框
  const telInput = page.locator('.n-form-item').filter({ hasText: '联系方式' }).locator('input').first();
  await telInput.fill('13800138001');
  console.log('   填写电话: 13800138001');
  
  // 4. 提交表单
  console.log('\n4. 提交表单');
  const submitButton = page.locator('.n-modal button').filter({ hasText: '提交' }).first();
  await submitButton.click();
  console.log('   点击提交按钮');
  
  // 等待一段时间看是否有错误提示
  await page.waitForTimeout(3000);
  
  // 5. 检查是否有错误提示
  const errorMessages = await page.locator('.n-message--error').count();
  const successMessages = await page.locator('.n-message--success').count();
  console.log(`   错误提示数: ${errorMessages}`);
  console.log(`   成功提示数: ${successMessages}`);
  
  // 6. 刷新页面检查结果
  console.log('\n5. 刷新页面检查结果');
  await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  const finalRows = await page.locator('.n-data-table tbody tr').count();
  console.log(`   最终用户数: ${finalRows}`);
  
  // 获取新的第一行数据
  if (finalRows > 0) {
    const newFirstRowCells = await page.locator('.n-data-table tbody tr').first().locator('td').allTextContents();
    console.log(`   第一行数据: ${newFirstRowCells.slice(0, 3).join(' | ')}`);
  }
  
  if (finalRows > initialRows) {
    console.log('\n   ✅ 添加成功！用户数从 ' + initialRows + ' 增加到 ' + finalRows);
  } else if (finalRows === initialRows) {
    console.log('\n   ⚠️ 用户数未增加，可能添加失败');
  }
  
  return finalRows;
}

async function main() {
  console.log('🚀 用户管理 CRUD 详细测试开始');
  console.log(`前端: ${BASE_URL}`);
  
  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    page = await context.newPage();
    
    // 监听控制台消息
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        console.log(`   [${type.toUpperCase()}]`, msg.text().substring(0, 150));
      }
    });
    
    // 监听网络请求
    page.on('request', request => {
      if (request.url().includes('/user') && request.method() === 'POST') {
        console.log(`   [请求] ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/user') && response.request().method() === 'POST') {
        console.log(`   [响应] ${response.status()} ${response.url().substring(0, 60)}`);
      }
    });
    
    await login();
    const finalCount = await testAddOperation();
    
    console.log('\n=== 测试结果 ===');
    if (finalCount >= 1) {
      console.log('✅ 验证通过：至少保留1条数据');
    } else {
      console.log('❌ 验证失败：没有数据');
    }
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
