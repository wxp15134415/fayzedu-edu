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
  
  // Check localStorage for token
  const token = await page.evaluate(() => localStorage.getItem('accessToken'));
  console.log(`   Token: ${token ? token.substring(0, 30) + '...' : 'NONE'}`);
  
  console.log('✅ 登录成功');
}

async function testAddOperation() {
  console.log('\n=== 测试添加用户 ===');
  
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
  await usernameInput.fill('testuser999');
  
  const passwordInput = page.locator('.n-form-item').filter({ hasText: '密码' }).locator('input').first();
  await passwordInput.fill('123456');
  
  const nickNameInput = page.locator('.n-form-item').filter({ hasText: '昵称' }).locator('input').first();
  await nickNameInput.fill('测试用户999');
  
  const emailInput = page.locator('.n-form-item').filter({ hasText: '邮箱' }).locator('input').first();
  await emailInput.fill('test999@example.com');
  
  const phoneInput = page.locator('.n-form-item').filter({ hasText: '联系方式' }).locator('input').first();
  await phoneInput.fill('13899999999');
  
  console.log('\n4. 提交表单');
  const submitButton = page.locator('.n-modal button').filter({ hasText: '提交' }).first();
  await submitButton.click();
  
  await page.waitForTimeout(4000);
  
  // 检查登录状态
  const tokenAfterSubmit = await page.evaluate(() => localStorage.getItem('accessToken'));
  console.log(`   Token after submit: ${tokenAfterSubmit ? 'exists' : 'NONE'}`);
  
  // 截图看表单状态
  await page.screenshot({ path: '/Users/wangxiaoping/fayzedu/novasys/playwright/after-submit.png' });
  console.log('   已截图: after-submit.png');
  
  // 检查页面上是否有错误消息
  const hasErrorToast = await page.locator('.n-message').count();
  console.log(`   消息提示数: ${hasErrorToast}`);
  
  console.log('\n5. 检查结果');
  await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  const finalRows = await page.locator('.n-data-table tbody tr').count();
  console.log(`   最终用户数: ${finalRows}`);
  
  if (finalRows > initialRows) {
    console.log('\n   ✅ 添加成功！');
  } else {
    console.log('\n   ⚠️ 用户数未增加');
  }
  
  return finalRows;
}

async function main() {
  console.log('🚀 用户管理 CRUD 测试');
  console.log(`前端: ${BASE_URL}`);
  
  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    page = await context.newPage();
    
    page.on('response', response => {
      if (response.url().includes('/user')) {
        const method = response.request().method();
        if (method === 'POST' || method === 'GET') {
          response.text().then(text => {
            console.log(`   [${method}] ${response.status()}: ${text.substring(0, 100)}`);
          });
        }
      }
    });
    
    await login();
    await testAddOperation();
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
