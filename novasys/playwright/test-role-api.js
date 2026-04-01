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
    
    const apiRequests = [];
    const apiResponses = [];
    
    page.on('request', request => {
        const url = request.url();
        if (url.includes('/api/') || url.includes('localhost:3000')) {
            apiRequests.push({
                url: url,
                method: request.method(),
                headers: request.headers()
            });
        }
    });
    
    page.on('response', response => {
        const url = response.url();
        if (url.includes('/api/') || url.includes('localhost:3000')) {
            apiResponses.push({
                url: url,
                status: response.status(),
                statusText: response.statusText()
            });
        }
    });
    
    console.log('Navigating to login page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('Logging in...');
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
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/role-api-test.png`, fullPage: true });
    
    console.log('\n=== API Requests ===');
    apiRequests.forEach(req => {
        console.log(`${req.method} ${req.url}`);
    });
    
    console.log('\n=== API Responses ===');
    apiResponses.forEach(res => {
        console.log(`${res.status} ${res.statusText} ${res.url}`);
    });
    
    console.log('\n=== Console Errors ===');
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
            console.log(msg.text());
        }
    });
    
    await browser.close();
    console.log('\nTest completed!');
}

test().catch(console.error);
