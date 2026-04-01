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
    
    page.on('request', request => {
        const url = request.url();
        if (url.includes('localhost:3000')) {
            console.log(`REQUEST: ${request.method()} ${url}`);
            console.log('  Headers:', JSON.stringify(request.headers(), null, 2));
        }
    });
    
    page.on('response', response => {
        const url = response.url();
        if (url.includes('localhost:3000')) {
            console.log(`RESPONSE: ${response.status()} ${url}`);
        }
    });
    
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
    
    console.log('Navigating to role management page...');
    await page.goto(BASE_URL + '#/setting/role', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/role-final.png`, fullPage: true });
    
    console.log('\n=== Page Content ===');
    const content = await page.content();
    if (content.includes('服务器内部错误')) {
        console.log('Found: 服务器内部错误');
    }
    if (content.includes('无数据')) {
        console.log('Found: 无数据');
    }
    
    await browser.close();
    console.log('\nTest completed!');
}

test().catch(console.error);
