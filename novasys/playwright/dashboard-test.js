const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:9980/';
const BACKEND_URL = 'http://localhost:3000/';
const SCREENSHOT_DIR = '/Users/wangxiaoping/fayzedu/novasys/playwright/';
const TEST_USER = { username: 'super', password: '123456' };

// Ensure directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

function logError(message) {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
}

async function captureScreenshot(page, name) {
    const filename = `${SCREENSHOT_DIR}${name}-${Date.now()}.png`;
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

async function login(page) {
    log('Attempting to login...');
    
    try {
        await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1000);
        
        // Find login form elements
        const usernameInput = await page.$('input[type="text"], input[placeholder*="用户"], input.n-input__input-el');
        const passwordInput = await page.$('input[type="password"]');
        const loginButton = await page.$('button[type="submit"], button:has-text("登录"), .n-button:has-text("登录")');
        
        if (usernameInput && passwordInput && loginButton) {
            // Try different input methods
            await usernameInput.fill(TEST_USER.username);
            await passwordInput.fill(TEST_USER.password);
            await loginButton.click();
            
            // Wait for navigation after login
            await page.waitForTimeout(3000);
            
            log(`After login, URL: ${page.url()}`);
            return true;
        } else {
            logError('Login form elements not found');
            return false;
        }
    } catch (e) {
        logError(`Login error: ${e.message}`);
        return false;
    }
}

async function testDashboard() {
    log('\n=== Testing Dashboard Page ===');
    
    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-blink-features=AutomationControlled']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const consoleErrors = [];
    const networkErrors = [];
    let dashboardLoaded = false;
    let is404 = false;
    
    // Capture console messages
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
            logError(`Console Error: ${msg.text()}`);
        }
    });
    
    // Capture network errors
    page.on('requestfailed', request => {
        const error = `Failed: ${request.url()} - ${request.failure()?.errorText}`;
        networkErrors.push(error);
        logError(`Network Error: ${error}`);
    });
    
    // Capture 404 responses
    page.on('response', response => {
        if (response.status() === 404) {
            logError(`404 Response: ${response.url()}`);
            if (response.url().includes('dashboard')) {
                is404 = true;
            }
        }
    });
    
    try {
        // First login
        const loginSuccess = await login(page);
        if (!loginSuccess) {
            await captureScreenshot(page, 'login-failed');
            logError('Login failed, cannot test Dashboard');
            return { success: false, is404: false, error: 'Login failed' };
        }
        
        await captureScreenshot(page, 'after-login');
        
        // Navigate to Dashboard
        log('Navigating to Dashboard...');
        await page.goto(BASE_URL + '#/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        log(`Dashboard URL: ${currentUrl}`);
        
        // Check if 404
        if (currentUrl.includes('404') || is404) {
            logError('Dashboard page returned 404');
            is404 = true;
        } else {
            dashboardLoaded = true;
            log('Dashboard page loaded successfully');
        }
        
        // Capture screenshot
        await captureScreenshot(page, 'dashboard');
        
        // Check for data loading
        const pageContent = await page.content();
        
        // Check for loading indicators
        const loadingElements = await page.$$('.n-spin, .n-loading, .loading, .n-skeleton');
        log(`Loading elements found: ${loadingElements.length}`);
        
        // Check for dashboard content
        const hasStats = pageContent.includes('统计') || pageContent.includes('数据') || pageContent.includes('overview');
        const hasCharts = pageContent.includes('chart') || pageContent.includes('图表') || pageContent.includes('echarts');
        const hasTables = pageContent.includes('table') || pageContent.includes('表格');
        
        log(`Dashboard content check - Stats: ${hasStats}, Charts: ${hasCharts}, Tables: ${hasTables}`);
        
        // Check for visible data
        const bodyText = await page.evaluate(() => document.body.innerText);
        log(`Dashboard text content preview: ${bodyText.substring(0, 200)}...`);
        
    } catch (e) {
        logError(`Dashboard test error: ${e.message}`);
        await captureScreenshot(page, 'dashboard-error');
    }
    
    await context.close();
    await browser.close();
    
    return {
        success: dashboardLoaded,
        is404: is404,
        consoleErrors: consoleErrors,
        networkErrors: networkErrors
    };
}

async function run() {
    log('Starting Dashboard Test');
    
    // Check backend
    const backendOk = await checkBackendHealth();
    if (!backendOk) {
        logError('Backend is not responding on port 3000');
    }
    
    const result = await testDashboard();
    
    log('\n=== Test Results ===');
    log(`Dashboard loaded: ${result.success}`);
    log(`Dashboard 404: ${result.is404}`);
    log(`Console errors: ${result.consoleErrors?.length || 0}`);
    log(`Network errors: ${result.networkErrors?.length || 0}`);
    
    if (result.consoleErrors?.length > 0) {
        log('\nConsole Errors:');
        result.consoleErrors.forEach(e => log(`  - ${e}`));
    }
    
    if (result.networkErrors?.length > 0) {
        log('\nNetwork Errors:');
        result.networkErrors.forEach(e => log(`  - ${e}`));
    }
    
    return result;
}

run().then(result => {
    process.exit(result.success ? 0 : 1);
}).catch(e => {
    logError(`Test failed: ${e.message}`);
    process.exit(1);
});
