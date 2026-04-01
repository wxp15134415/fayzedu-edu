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
    
    const consoleMessages = [];
    const networkRequests = [];
    
    page.on('console', msg => {
        consoleMessages.push({ type: msg.type(), text: msg.text() });
    });
    
    page.on('response', response => {
        if (response.url().includes('/api/') || response.url().includes('/role')) {
            networkRequests.push({ 
                url: response.url(), 
                status: response.status(),
                statusText: response.statusText()
            });
        }
    });
    
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
    
    console.log('Navigating to role management page...');
    await page.goto(BASE_URL + '#/setting/role', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/role-detail-${Date.now()}.png`, fullPage: true });
    
    console.log('\n=== Network Requests ===');
    networkRequests.forEach(req => {
        console.log(`${req.status} ${req.url}`);
    });
    
    console.log('\n=== Console Errors ===');
    consoleMessages.filter(m => m.type === 'error').forEach(m => {
        console.log(m.text);
    });
    
    console.log('\n=== Page Content Check ===');
    const content = await page.content();
    console.log('Has 404:', content.includes('404'));
    console.log('Has 角色:', content.includes('角色'));
    console.log('Has n-data-table:', content.includes('n-data-table'));
    console.log('Has loading:', content.includes('loading'));
    
    const tableText = await page.textContent('body');
    console.log('\n=== Table Content (first 500 chars) ===');
    console.log(tableText.substring(0, 500));
    
    await browser.close();
    console.log('\nTest completed!');
}

test().catch(console.error);
