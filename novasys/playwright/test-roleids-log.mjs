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

async function testAddUserWithRoles() {
  console.log('\n=== 测试添加用户（多角色）===');
  
  console.log('\n1. 访问账户设置页面');
  await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);
  
  console.log('\n2. 点击"新建用户"按钮');
  const addButton = page.locator('button').filter({ hasText: '新建用户' }).first();
  await addButton.click();
  await page.waitForTimeout(2000);
  
  console.log('\n3. 填写表单基础信息');
  
  const usernameInput = page.locator('.n-form-item').filter({ hasText: '用户名' }).locator('input').first();
  await usernameInput.fill('testuser_roles');
  
  const passwordInput = page.locator('.n-form-item').filter({ hasText: '密码' }).locator('input').first();
  await passwordInput.fill('123456');
  
  const nickNameInput = page.locator('.n-form-item').filter({ hasText: '昵称' }).locator('input').first();
  await nickNameInput.fill('测试角色用户');
  
  console.log('\n4. 选择角色（多选）');
  
  // 查找角色选择框并点击打开
  const roleSelect = page.locator('.n-form-item').filter({ hasText: '角色' }).locator('.n-base-selection').first();
  await roleSelect.click();
  await page.waitForTimeout(1000);
  
  // 获取所有可用角色选项
  const roleOptions = page.locator('.n-base-selection-option');
  const optionCount = await roleOptions.count();
  console.log(`   发现 ${optionCount} 个角色选项`);
  
  // 选择多个角色（选择前3个）
  const rolesToSelect = Math.min(3, optionCount);
  for (let i = 0; i < rolesToSelect; i++) {
    const option = roleOptions.nth(i);
    const label = await option.textContent();
    console.log(`   选择角色: ${label?.trim()}`);
    await option.click();
    await page.waitForTimeout(500);
  }
  
  // 点击空白处关闭下拉框
  await page.locator('.n-modal').first().click({ position: { x: 10, y: 10 } });
  await page.waitForTimeout(500);
  
  console.log('\n5. 点击提交按钮');
  const submitButton = page.locator('.n-modal button').filter({ hasText: '提交' }).first();
  await submitButton.click();
  
  await page.waitForTimeout(4000);
  
  console.log('\n✅ 测试完成');
}

async function main() {
  console.log('🚀 角色数据日志捕获测试');
  console.log(`前端: ${BASE_URL}`);
  
  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    page = await context.newPage();
    
    // 捕获所有控制台日志
    console.log('\n=== 开启控制台日志捕获 ===');
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      
      // 特别关注 roleIds 相关的日志
      if (text.toLowerCase().includes('roleids') || 
          text.toLowerCase().includes('role') ||
          text.toLowerCase().includes('role_id')) {
        console.log(`   [${type.toUpperCase()}] ${text}`);
      }
      
      // 也显示所有包含 "role" 的日志
      if (text.includes('role') || text.includes('Role')) {
        console.log(`   [${type.toUpperCase()}] ${text}`);
      }
    });
    
    // 捕获网络请求中的 roleIds
    page.on('request', request => {
      if (request.url().includes('/user') && request.method() === 'POST') {
        const postData = request.postData();
        if (postData && postData.includes('roleId')) {
          console.log('\n=== POST 请求中的 roleId 数据 ===');
          console.log(postData);
        }
      }
    });
    
    // 捕获网络响应
    page.on('response', response => {
      if (response.url().includes('/user') && response.request().method() === 'POST') {
        response.text().then(text => {
          if (text.includes('roleId') || text.includes('role')) {
            console.log('\n=== POST 响应中的 role 数据 ===');
            console.log(text.substring(0, 500));
          }
        });
      }
    });
    
    await login();
    await testAddUserWithRoles();
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();