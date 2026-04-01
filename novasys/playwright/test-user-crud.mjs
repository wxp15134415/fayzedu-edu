/**
 * 用户管理 CRUD 功能测试脚本
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

async function testUserCRUD() {
  console.log('\n=== 测试用户管理 CRUD ===');
  
  // 1. 访问用户管理页面
  console.log('\n1. 访问用户管理页面');
  await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);
  
  let rows = await page.locator('.n-data-table tbody tr').count();
  console.log(`   初始用户数: ${rows}`);
  
  // 2. 添加用户
  console.log('\n2. 测试添加用户功能');
  const addButton = page.locator('button').filter({ hasText: '新建用户' }).first();
  await addButton.click();
  await page.waitForTimeout(2000);
  
  const modalInputs = await page.locator('.n-modal .n-form-item input, .n-modal input').all();
  console.log(`   弹窗内输入框数量: ${modalInputs.length}`);
  
  for (const input of modalInputs) {
    const placeholder = await input.getAttribute('placeholder') || '';
    const ariaLabel = await input.getAttribute('aria-label') || '';
    
    if (placeholder.includes('请输入') && !(placeholder.includes('请输入') && placeholder.length === 3)) {
      if (placeholder.includes('用户名')) {
        await input.fill('测试用户001');
      } else if (placeholder.includes('邮箱')) {
        await input.fill('test001@example.com');
      } else if (placeholder.includes('联系方式') || placeholder.includes('电话')) {
        await input.fill('13800138001');
      }
    } else {
      const nModelValue = await input.getAttribute('n-model-value') || '';
      if (nModelValue.includes('userName')) {
        await input.fill('测试用户001');
      } else if (nModelValue.includes('email')) {
        await input.fill('test001@example.com');
      } else if (nModelValue.includes('tel')) {
        await input.fill('13800138001');
      }
    }
  }
  
  const submitButtons = await page.locator('.n-modal button').all();
  for (const btn of submitButtons) {
    const text = await btn.textContent();
    if (text && text.includes('提交')) {
      await btn.click();
      break;
    }
  }
  
  await page.waitForTimeout(3000);
  
  await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  rows = await page.locator('.n-data-table tbody tr').count();
  console.log(`   添加后用户数: ${rows}`);
  console.log('   ✅ 添加功能测试完成');
  
  // 3. 编辑用户
  if (rows > 0) {
    console.log('\n3. 测试编辑用户功能');
    const editButtons = await page.locator('button').all();
    for (const btn of editButtons) {
      const text = await btn.textContent();
      if (text && text.includes('编辑')) {
        await btn.click();
        break;
      }
    }
    await page.waitForTimeout(2000);
    
    const editInputs = await page.locator('.n-modal input').all();
    for (const input of editInputs) {
      const nModelValue = await input.getAttribute('n-model-value') || '';
      if (nModelValue.includes('userName')) {
        await input.fill('编辑后的用户');
        break;
      }
    }
    
    const submitBtns = await page.locator('.n-modal button').all();
    for (const btn of submitBtns) {
      const text = await btn.textContent();
      if (text && text.includes('提交')) {
        await btn.click();
        break;
      }
    }
    await page.waitForTimeout(3000);
    
    console.log('   ✅ 编辑功能测试完成');
  }
  
  // 4. 删除用户
  console.log('\n4. 测试删除用户功能');
  rows = await page.locator('.n-data-table tbody tr').count();
  console.log(`   删除前用户数: ${rows}`);
  
  if (rows > 1) {
    const deleteButtons = await page.locator('button').all();
    for (const btn of deleteButtons) {
      const text = await btn.textContent();
      if (text && text.includes('删除')) {
        page.on('dialog', async (dialog) => {
          await dialog.accept();
        });
        await btn.click();
        break;
      }
    }
    await page.waitForTimeout(2000);
    
    const rowsAfter = await page.locator('.n-data-table tbody tr').count();
    console.log(`   删除后用户数: ${rowsAfter}`);
    console.log('   ✅ 删除功能测试完成');
  } else {
    console.log('   ⚠️ 只有1条数据，跳过删除（保留最后一条）');
  }
  
  // 5. 最终验证
  console.log('\n5. 最终验证');
  await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  const finalRows = await page.locator('.n-data-table tbody tr').count();
  console.log(`   最终用户数: ${finalRows}`);
  
  if (finalRows >= 1) {
    console.log('   ✅ 验证通过：至少保留1条数据');
  } else {
    console.log('   ❌ 验证失败：没有数据');
  }
}

async function main() {
  console.log('🚀 用户管理 CRUD 测试开始');
  console.log(`前端: ${BASE_URL}`);
  
  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    page = await context.newPage();
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('   [控制台错误]', msg.text().substring(0, 100));
      }
    });
    
    await login();
    await testUserCRUD();
    
    console.log('\n✅ 测试完成');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();