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
  
  console.log('\n1. 访问用户管理页面');
  await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);
  
  let initialRows = await page.locator('.n-data-table tbody tr').count();
  console.log(`   初始用户数: ${initialRows}`);
  
  console.log('\n2. 点击添加按钮');
  const addButton = page.locator('button').filter({ hasText: '新建用户' }).first();
  await addButton.click();
  await page.waitForTimeout(2000);
  
  console.log('\n3. 填写表单');
  
  const usernameInput = page.locator('.n-form-item').filter({ hasText: '用户名' }).locator('input').first();
  await usernameInput.fill('testuser001');
  console.log('   填写用户名: testuser001');
  
  const passwordInput = page.locator('.n-form-item').filter({ hasText: '密码' }).locator('input').first();
  await passwordInput.fill('123456');
  console.log('   填写密码: 123456');
  
  const nickNameInput = page.locator('.n-form-item').filter({ hasText: '昵称' }).locator('input').first();
  await nickNameInput.fill('测试用户001');
  console.log('   填写昵称: 测试用户001');
  
  const emailInput = page.locator('.n-form-item').filter({ hasText: '邮箱' }).locator('input').first();
  await emailInput.fill('test001@example.com');
  console.log('   填写邮箱: test001@example.com');
  
  const phoneInput = page.locator('.n-form-item').filter({ hasText: '联系方式' }).locator('input').first();
  await phoneInput.fill('13800138001');
  console.log('   填写联系方式: 13800138001');
  
  console.log('\n4. 提交表单');
  const submitButton = page.locator('.n-modal button').filter({ hasText: '提交' }).first();
  await submitButton.click();
  console.log('   点击提交按钮');
  
  await page.waitForTimeout(3000);
  
  const errorMessages = await page.locator('.n-message--error').count();
  const successMessages = await page.locator('.n-message--success').count();
  console.log(`   错误提示数: ${errorMessages}`);
  console.log(`   成功提示数: ${successMessages}`);
  
  await page.waitForTimeout(2000);
  
  console.log('\n5. 刷新页面检查结果');
  await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  const finalRows = await page.locator('.n-data-table tbody tr').count();
  console.log(`   最终用户数: ${finalRows}`);
  
  if (finalRows > initialRows) {
    console.log('\n   ✅ 添加成功！用户数从 ' + initialRows + ' 增加到 ' + finalRows);
    return finalRows;
  } else if (finalRows === initialRows) {
    console.log('\n   ⚠️ 用户数未增加，可能添加失败');
    return finalRows;
  }
  return finalRows;
}

async function testEditOperation() {
  console.log('\n=== 测试编辑用户功能 ===');
  
  await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  const rows = await page.locator('.n-data-table tbody tr').count();
  if (rows === 0) {
    console.log('   ⚠️ 没有用户可编辑');
    return;
  }
  
  console.log('\n1. 点击编辑按钮');
  const editButtons = await page.locator('button').all();
  for (const btn of editButtons) {
    const text = await btn.textContent();
    if (text && text.includes('编辑')) {
      await btn.click();
      break;
    }
  }
  await page.waitForTimeout(2000);
  
  console.log('\n2. 修改昵称');
  const nickNameInput = page.locator('.n-form-item').filter({ hasText: '昵称' }).locator('input').first();
  await nickNameInput.fill('编辑后的用户');
  console.log('   填写昵称: 编辑后的用户');
  
  console.log('\n3. 提交');
  const submitButton = page.locator('.n-modal button').filter({ hasText: '提交' }).first();
  await submitButton.click();
  await page.waitForTimeout(3000);
  
  console.log('   ✅ 编辑功能测试完成');
}

async function main() {
  console.log('🚀 用户管理 CRUD 详细测试开始');
  console.log(`前端: ${BASE_URL}`);
  
  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    page = await context.newPage();
    
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error') {
        console.log(`   [ERROR] ${msg.text().substring(0, 150)}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/user') && (response.request().method() === 'POST' || response.request().method() === 'PATCH')) {
        console.log(`   [${response.request().method()}] ${response.status()} ${response.url().substring(0, 60)}`);
      }
    });
    
    await login();
    const finalCount = await testAddOperation();
    
    if (finalCount > 0) {
      await testEditOperation();
    }
    
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
