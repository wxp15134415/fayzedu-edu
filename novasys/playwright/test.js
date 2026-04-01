const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:9980/';
const BACKEND_URL = 'http://localhost:3000/';
const SCREENSHOT_DIR = '/Users/wangxiaoping/fayzedu/novasys/playwright/screenshots';
const LOG_FILE = '/Users/wangxiaoping/fayzedu/novasys/playwright/test-log.txt';

// Ensure directories exist
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Initialize log file
fs.writeFileSync(LOG_FILE, `=== Nova Admin Playwright Test ===\nStarted at: ${new Date().toISOString()}\n\n`);

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

async function checkBackendHealth() {
    try {
        const response = await fetch(BACKEND_URL + 'health', {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });
        if (response.ok) {
            log('Backend health check: OK');
            return true;
        }
    } catch (e) {
        logError(`Backend health check failed: ${e.message}`);
    }
    return false;
}

async function testLoginPage(browser) {
    log('\n=== Testing Login Page ===');
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const issues = [];
    
    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleMessages.push(`[ERROR] ${msg.text()}`);
        }
    });
    
    // Capture network errors
    const networkErrors = [];
    page.on('requestfailed', request => {
        networkErrors.push(`Failed: ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    try {
        await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
        await captureScreenshot(page, 'login-page');
        
        // Check if captcha exists
        const captchaInput = await page.$('input[placeholder*="证码"], input[placeholder*="码"]');
        if (captchaInput) {
            log('Captcha field found on login page');
        } else {
            log('No captcha field found on login page');
        }
        
        // Check form elements
        const usernameInput = await page.$('input[type="text"], input[placeholder*="用户"]');
        const passwordInput = await page.$('input[type="password"]');
        const loginButton = await page.$('button[type="submit"], button:has-text("登录"), .n-button:has-text("登录")');
        
        log(`Login form elements - Username: ${!!usernameInput}, Password: ${!!passwordInput}, Button: ${!!loginButton}`);
        
        // Try to login with test credentials
        if (usernameInput && passwordInput && loginButton) {
            await usernameInput.fill('admin');
            await passwordInput.fill('123456');
            await loginButton.click();
            
            // Wait for navigation
            await page.waitForTimeout(3000);
            
            const currentUrl = page.url();
            log(`After login attempt, URL: ${currentUrl}`);
            await captureScreenshot(page, 'after-login');
            
            if (currentUrl.includes('dashboard') || currentUrl.includes('index') || currentUrl === BASE_URL) {
                log('Login appears successful');
            } else {
                issues.push('Login may have failed - unexpected redirect');
            }
        }
        
    } catch (e) {
        logError(`Login page test error: ${e.message}`);
        issues.push(`Exception: ${e.message}`);
    }
    
    if (consoleMessages.length > 0) {
        log('Console errors on login page:');
        consoleMessages.forEach(m => log(`  ${m}`));
        issues.push(...consoleMessages.map(m => `Console: ${m}`));
    }
    
    if (networkErrors.length > 0) {
        log('Network errors on login page:');
        networkErrors.forEach(m => log(`  ${m}`));
        issues.push(...networkErrors.map(m => `Network: ${m}`));
    }
    
    await context.close();
    return issues;
}

async function testDashboard(browser) {
    log('\n=== Testing Dashboard ===');
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const issues = [];
    const consoleMessages = [];
    const networkErrors = [];
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleMessages.push(`[ERROR] ${msg.text()}`);
        }
    });
    
    page.on('requestfailed', request => {
        networkErrors.push(`Failed: ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    try {
        await page.goto(BASE_URL + '#/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);
        await captureScreenshot(page, 'dashboard');
        
        // Check for data loading indicators
        const loadingElements = await page.$$('.n-spin, .n-loading, .loading');
        log(`Dashboard loading elements: ${loadingElements.length}`);
        
        // Check for any visible data
        const content = await page.content();
        if (content.includes('统计') || content.includes('数据') || content.includes('dashboard')) {
            log('Dashboard content found');
        }
        
    } catch (e) {
        logError(`Dashboard test error: ${e.message}`);
        issues.push(`Exception: ${e.message}`);
    }
    
    if (consoleMessages.length > 0) {
        log('Console errors on dashboard:');
        consoleMessages.forEach(m => log(`  ${m}`));
        issues.push(...consoleMessages.map(m => `Console: ${m}`));
    }
    
    if (networkErrors.length > 0) {
        log('Network errors on dashboard:');
        networkErrors.forEach(m => log(`  ${m}`));
        issues.push(...networkErrors.map(m => `Network: ${m}`));
    }
    
    await context.close();
    return issues;
}

async function testMenuPages(browser, menuPath, pageName) {
    log(`\n=== Testing ${pageName} ===`);
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const issues = [];
    const consoleMessages = [];
    const networkErrors = [];
    let pageCrashed = false;
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleMessages.push(`[ERROR] ${msg.text()}`);
        }
    });
    
    page.on('pageerror', error => {
        logError(`Page error on ${pageName}: ${error.message}`);
        issues.push(`Page crash: ${error.message}`);
        pageCrashed = true;
    });
    
    page.on('requestfailed', request => {
        networkErrors.push(`Failed: ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    try {
        await page.goto(BASE_URL + `#${menuPath}`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);
        
        if (!pageCrashed) {
            await captureScreenshot(page, pageName.replace(/[^a-z0-9]/gi, '-').toLowerCase());
        }
        
        // Check for table or data
        const tables = await page.$$('table, .n-data-table, .n-table');
        log(`${pageName} tables found: ${tables.length}`);
        
        // Check for empty state
        const emptyStates = await page.$$('.n-empty, .empty, [placeholder*="暂无"]');
        log(`${pageName} empty states: ${emptyStates.length}`);
        
    } catch (e) {
        logError(`${pageName} test error: ${e.message}`);
        issues.push(`Exception: ${e.message}`);
    }
    
    if (consoleMessages.length > 0) {
        log(`Console errors on ${pageName}:`);
        consoleMessages.forEach(m => log(`  ${m}`));
        issues.push(...consoleMessages.map(m => `Console: ${m}`));
    }
    
    if (networkErrors.length > 0) {
        log(`Network errors on ${pageName}:`);
        networkErrors.forEach(m => log(`  ${m}`));
        issues.push(...networkErrors.map(m => `Network: ${m}`));
    }
    
    await context.close();
    return issues;
}

async function runTests() {
    log('Starting Nova Admin Playwright Tests');
    
    // Check backend first
    const backendOk = await checkBackendHealth();
    if (!backendOk) {
        logError('Backend is not responding. Please ensure the backend server is running on port 3000');
    }
    
    // Launch browser (not headless to see actual window)
    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-blink-features=AutomationControlled']
    });
    
    log('Browser launched successfully');
    
    const allIssues = [];
    
    // Test login page
    const loginIssues = await testLoginPage(browser);
    allIssues.push(...loginIssues.map(i => `Login: ${i}`));
    
    // If logged in successfully, test other pages
    // Test Dashboard
    const dashboardIssues = await testDashboard(browser);
    allIssues.push(...dashboardIssues.map(i => `Dashboard: ${i}`));
    
    // Test system management pages
    const menuPages = [
        { path: '/system/user', name: 'UserManagement' },
        { path: '/system/role', name: 'RoleManagement' },
        { path: '/system/menu', name: 'MenuManagement' },
        { path: '/system/department', name: 'DepartmentManagement' },
        { path: '/system/dict-type', name: 'DictType' },
        { path: '/system/dict-data', name: 'DictData' },
    ];
    
    for (const menuPage of menuPages) {
        const issues = await testMenuPages(browser, menuPage.path, menuPage.name);
        allIssues.push(...issues.map(i => `${menuPage.name}: ${i}`));
    }
    
    // Close browser
    await browser.close();
    
    // Summary
    log('\n=== Test Summary ===');
    log(`Total issues found: ${allIssues.length}`);
    
    if (allIssues.length > 0) {
        log('\nIssues:');
        allIssues.forEach((issue, idx) => {
            log(`  ${idx + 1}. ${issue}`);
        });
    } else {
        log('No issues found!');
    }
    
    log(`\nTest completed at: ${new Date().toISOString()}`);
    log(`Log file: ${LOG_FILE}`);
    log(`Screenshots: ${SCREENSHOT_DIR}`);
    
    return allIssues;
}

runTests().catch(console.error);
