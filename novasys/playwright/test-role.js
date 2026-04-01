const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:9980/';
const BACKEND_URL = 'http://localhost:3000/';
const SCREENSHOT_DIR = '/Users/wangxiaoping/fayzedu/novasys/playwright/screenshots';
const LOG_FILE = '/Users/wangxiaoping/fayzedu/novasys/playwright/role-test-log.txt';

if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

fs.writeFileSync(LOG_FILE, `=== Role Management Page Test ===\nStarted at: ${new Date().toISOString()}\n\n`);

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, logMessage);
    console.log(message);
}

function logError(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message}\n`;
    fs.appendFileSync(LOG_FILE, logMessage);
    console.error(message);
}

async function captureScreenshot(page, name) {
    const filename = `${SCREENSHOT_DIR}/${name}-${Date.now()}.png`;
    await page.screenshot({ path: filename, fullPage: true });
    log(`Screenshot saved: ${filename}`);
    return filename;
}

async function login(page) {
    log('\n=== Logging in ===');
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await captureScreenshot(page, '01-login-page');
    
    await page.waitForSelector('input[type="text"], input[placeholder*="用户"]', { timeout: 10000 });
    
    const usernameInput = await page.$('input[type="text"], input[placeholder*="用户"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button[type="submit"], button:has-text("登录")');
    
    if (!usernameInput || !passwordInput || !loginButton) {
        throw new Error('Login form elements not found');
    }
    
    await usernameInput.fill('super');
    await passwordInput.fill('123456');
    
    await loginButton.click();
    
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    log(`After login, URL: ${currentUrl}`);
    await captureScreenshot(page, '02-after-login');
    
    return currentUrl;
}

async function testRoleManagementPage(browser) {
    log('\n=== Testing Role Management Page ===');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const issues = [];
    const consoleMessages = [];
    const networkErrors = [];
    let pageCrashed = false;
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            const errorMsg = `[ERROR] ${msg.text()}`;
            consoleMessages.push(errorMsg);
            log(errorMsg);
        }
    });
    
    page.on('pageerror', error => {
        logError(`Page crash: ${error.message}`);
        issues.push(`Page crash: ${error.message}`);
        pageCrashed = true;
    });
    
    page.on('requestfailed', request => {
        const errorMsg = `Failed: ${request.url()} - ${request.failure()?.errorText}`;
        networkErrors.push(errorMsg);
        logError(errorMsg);
    });
    
    try {
        await login(page);
        
        log('\nNavigating to role management page: /setting/role');
        await page.goto(BASE_URL + '#/setting/role', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);
        
        const pageContent = await page.content();
        const is404 = pageContent.includes('404') || pageContent.includes('Not Found') || pageContent.includes('页面不存在');
        
        if (is404) {
            logError('Page returned 404!');
            issues.push('Page returned 404');
        } else {
            log('Page loaded successfully (no 404 detected)');
        }
        
        await captureScreenshot(page, '03-role-management');
        
        const tables = await page.$$('table, .n-data-table, .n-table');
        log(`Data tables found: ${tables.length}`);
        
        const emptyStates = await page.$$('.n-empty, .empty, [placeholder*="暂无"], .n-result');
        log(`Empty states found: ${emptyStates.length}`);
        
        const loadingElements = await page.$$('.n-spin, .n-loading, .loading, [class*="loading"]');
        log(`Loading elements found: ${loadingElements.length}`);
        
        const pageTitle = await page.title();
        log(`Page title: ${pageTitle}`);
        
        const hasRoleContent = pageContent.includes('角色') || pageContent.includes('role') || pageContent.includes('Role');
        log(`Has role-related content: ${hasRoleContent}`);
        
    } catch (e) {
        logError(`Test error: ${e.message}`);
        issues.push(`Exception: ${e.message}`);
    }
    
    if (consoleMessages.length > 0) {
        log('\n--- Console Errors ---');
        consoleMessages.forEach(m => {
            log(`  ${m}`);
        });
        issues.push(...consoleMessages);
    }
    
    if (networkErrors.length > 0) {
        log('\n--- Network Errors ---');
        networkErrors.forEach(m => {
            log(`  ${m}`);
        });
        issues.push(...networkErrors);
    }
    
    await context.close();
    return issues;
}

async function runTests() {
    log('Starting Role Management Page Test');
    
    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-blink-features=AutomationControlled']
    });
    
    log('Browser launched successfully');
    
    const issues = await testRoleManagementPage(browser);
    
    await browser.close();
    
    log('\n=== Test Summary ===');
    log(`Total issues found: ${issues.length}`);
    
    if (issues.length > 0) {
        log('\nIssues:');
        issues.forEach((issue, idx) => {
            log(`  ${idx + 1}. ${issue}`);
        });
    } else {
        log('No issues found! Role management page is working correctly.');
    }
    
    log(`\nTest completed at: ${new Date().toISOString()}`);
    log(`Log file: ${LOG_FILE}`);
    log(`Screenshots: ${SCREENSHOT_DIR}`);
    
    return issues;
}

runTests().catch(console.error);
