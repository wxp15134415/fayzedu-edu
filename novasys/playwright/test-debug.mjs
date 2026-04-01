/**
 * 用户管理 CRUD 功能测试脚本 - 增强版
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:9980';
const API_URL = 'http://localhost:3000';
const USERNAME = 'super';
const PASSWORD = '123456';

let browser;
let context;
let page;

async function login() {
  console.log('\n=== 执行登录 ===');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // 输入用户名和密码
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
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && text.includes('登录')) {
      await btn.click();
      break;
    }
  }
  
  // 等待登录成功
  await page.waitForTimeout(5000);
  
  // 检查当前 URL
  console.log('   当前 URL:', page.url());
  console.log('✅ 登录完成');
}

async function testUserCRUD() {
  console.log('\n=== 测试用户管理 CRUD ===');
  
  // 1. 访问用户管理页面
  console.log('\n1. 访问用户管理页面');
  await page.goto(`${BASE_URL}/setting/account`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(5000);
  
  // 打印页面内容摘要
  const title = await page.title();
  console.log('   页面标题:', title);
  console.log('   当前 URL:', page.url());
  
  // 获取所有可点击的按钮
  const buttons = await page.locator('button').all();
  console.log(`   页面按钮数: ${buttons.length}`);
  
  for (let i = 0; i < Math.min(buttons.length, 10); i++) {
    const text = await buttons[i].textContent();
    console.log(`   按钮 ${i + 1}: ${text?.trim() || '(无文本)'}`);
  }
  
  // 获取页面中的文本内容
  const bodyText = await page.locator('body').textContent();
  console.log('   页面包含"用户":', bodyText?.includes('用户'));
  console.log('   页面包含"新建":', bodyText?.includes('新建'));
  
  // 2. 检查是否有表格
  console.log('\n2. 检查表格');
  const tables = await page.locator('.n-data-table, table').count();
  console.log(`   表格数量: ${tables}`);
  
  if (tables > 0) {
    const rows = await page.locator('.n-data-table tbody tr, table tbody tr').count();
    console.log(`   表格行数: ${rows}`);
  }
}

async function main() {
  console.log('🚀 用户管理 CRUD 测试开始');
  console.log(`前端: ${BASE_URL}`);
  console.log(`后端: ${API_URL}`);
  
  try {
    // 启动浏览器
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    page = await context.newPage();
    
    // 监听控制台消息
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('   [控制台错误]', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.log('   [页面错误]', error.message);
    });
    
    // 执行测试
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