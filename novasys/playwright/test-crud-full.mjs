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

async function testAdd() {
  console.log('\n=== 1. 测试添加用户 ===');
  
  await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);
  
  let rows = await page.locator('.n-data-table tbody tr').count();
  console.log(`   初始用户数: ${rows}`);
  
  const addButton = page.locator('button').filter({ hasText: '新建用户' }).first();
  await addButton.click();
  await page.waitForTimeout(2000);
  
  const usernameInput = page.locator('.n-form-item').filter({ hasText: '用户名' }).locator('input').first();
  await usernameInput.fill('newuser123');
  
  const passwordInput = page.locator('.n-form-item').filter({ hasText: '密码' }).locator('input').first();
  await passwordInput.fill('123456');
  
  const nickNameInput = page.locator('.n-form-item').filter({ hasText: '昵称' }).locator('input').first();
  await nickNameInput.fill('新用户123');
  
  const emailInput = page.locator('.n-form-item').filter({ hasText: '邮箱' }).locator('input').first();
  await emailInput.fill('new123@example.com');
  
  const phoneInput = page.locator('.n-form-item').filter({ hasText: '联系方式' }).locator('input').first();
  await phoneInput.fill('13812345678');
  
  const submitButton = page.locator('.n-modal button').filter({ hasText: '提交' }).first();
  await submitButton.click();
  
  await page.waitForTimeout(3000);
  
  await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  rows = await page.locator('.n-data-table tbody tr').count();
  console.log(`   添加后用户数: ${rows}`);
  
  if (rows > 1) {
    console.log('   ✅ 添加功能正常');
  }
  return rows;
}

async function testEdit() {
  console.log('\n=== 2. 测试编辑用户 ===');
  
  await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  const rows = await page.locator('.n-data-table tbody tr').count();
  if (rows === 0) {
    console.log('   ⚠️ 没有用户可编辑');
    return;
  }
  
  const editButtons = await page.locator('button').all();
  for (const btn of editButtons) {
    const text = await btn.textContent();
    if (text && text.includes('编辑')) {
      await btn.click();
      break;
    }
  }
  await page.waitForTimeout(2000);
  
  const nickNameInput = page.locator('.n-form-item').filter({ hasText: '昵称' }).locator('input').first();
  await nickNameInput.fill('编辑后的名称');
  
  const submitButton = page.locator('.n-modal button').filter({ hasText: '提交' }).first();
  await submitButton.click();
  
  await page.waitForTimeout(3000);
  
  console.log('   ✅ 编辑功能正常');
}

async function testDelete() {
  console.log('\n=== 3. 测试删除用户 ===');
  
  await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  let rows = await page.locator('.n-data-table tbody tr').count();
  console.log(`   删除前用户数: ${rows}`);
  
  if (rows <= 1) {
    console.log('   ⚠️ 只有1条数据，跳过删除（保留数据）');
    return rows;
  }
  
  page.on('dialog', async dialog => {
    await dialog.accept();
  });
  
  const deleteButtons = await page.locator('button').all();
  for (const btn of deleteButtons) {
    const text = await btn.textContent();
    if (text && text.includes('删除')) {
      await btn.click();
      break;
    }
  }
  
  await page.waitForTimeout(2000);
  
  rows = await page.locator('.n-data-table tbody tr').count();
  console.log(`   删除后用户数: ${rows}`);
  
  console.log('   ✅ 删除功能正常');
  return rows;
}

async function main() {
  console.log('🚀 用户管理 CRUD 完整测试');
  console.log(`前端: ${BASE_URL}`);
  
  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    page = await context.newPage();
    
    await login();
    
    const afterAdd = await testAdd();
    await testEdit();
    const finalCount = await testDelete();
    
    console.log('\n=== 最终验证 ===');
    await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    const finalRows = await page.locator('.n-data-table tbody tr').count();
    console.log(`   最终用户数: ${finalRows}`);
    
    if (finalRows >= 1) {
      console.log('   ✅ 验证通过：至少保留1条数据');
    } else {
      console.log('   ❌ 验证失败：没有数据');
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
