const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'http://localhost:9980/';
const SCREENSHOT_DIR = '/Users/wangxiaoping/fayzedu/novasys/playwright/screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function test() {
    console.log('Starting test...');
    
    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-blink-features=AutomationControlled']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('Navigating to login page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('Filling login form...');
    const usernameInput = await page.$('input[type="text"], input[placeholder*="用户"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button[type="submit"], button:has-text("登录")');
    
    await usernameInput.fill('super');
    await passwordInput.fill('123456');
    await loginButton.click();
    
    await page.waitForTimeout(3000);
    console.log('After login, URL:', page.url());
    await page.screenshot({ path: `${SCREENSHOT_DIR}/step1-after-login.png`, fullPage: true });
    
    console.log('Looking for menu items...');
    const menuItems = await page.$$('a, .menu-item, [class*="menu"]');
    console.log(`Found ${menuItems.length} menu items`);
    
    console.log('Clicking on system settings...');
    const settingLink = await page.$('text=系统设置');
    if (settingLink) {
        await settingLink.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/step2-after-settings-click.png`, fullPage: true });
        console.log('URL after settings click:', page.url());
    }
    
    console.log('Looking for role management link...');
    const roleLink = await page.$('text=角色设置');
    if (roleLink) {
        await roleLink.click();
        await page.waitForTimeout(3000);
    } else {
        console.log('Role link not found, trying direct navigation...');
        await page.goto(BASE_URL + '#/setting/role', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);
    }
    
    console.log('Final URL:', page.url());
    await page.screenshot({ path: `${SCREENSHOT_DIR}/step3-final-role-page.png`, fullPage: true });
    
    console.log('\n=== Page Analysis ===');
    const content = await page.content();
    console.log('Has 404:', content.includes('404'));
    console.log('Has 角色:', content.includes('角色'));
    console.log('Has n-data-table:', content.includes('n-data-table'));
    
    const tableText = await page.textContent('body');
    console.log('\n=== Page Text Content ===');
    console.log(tableText.substring(0, 1000));
    
    await browser.close();
    console.log('\nTest completed!');
}

test().catch(console.error);
