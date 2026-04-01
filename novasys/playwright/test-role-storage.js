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
    
    console.log('Logging in...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    
    const usernameInput = await page.$('input[type="text"], input[placeholder*="用户"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button[type="submit"], button:has-text("登录")');
    
    await usernameInput.fill('super');
    await passwordInput.fill('123456');
    await loginButton.click();
    
    await page.waitForTimeout(3000);
    console.log('After login, URL:', page.url());
    
    console.log('Checking localStorage...');
    const localStorage = await page.evaluate(() => {
        const items = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            items[key] = localStorage.getItem(key);
        }
        return items;
    });
    console.log('localStorage:', JSON.stringify(localStorage, null, 2));
    
    console.log('Navigating to role management page...');
    await page.goto(BASE_URL + '#/setting/role', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    console.log('Checking localStorage after navigation...');
    const localStorage2 = await page.evaluate(() => {
        const items = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            items[key] = localStorage.getItem(key);
        }
        return items;
    });
    console.log('localStorage:', JSON.stringify(localStorage2, null, 2));
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/role-storage-check.png`, fullPage: true });
    
    await browser.close();
    console.log('\nTest completed!');
}

test().catch(console.error);
