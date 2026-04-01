const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:9980/';
const BACKEND_URL = 'http://localhost:3000/';
const SCREENSHOT_DIR = '/Users/wangxiaoping/fayzedu/novasys/playwright/screenshots';
const LOG_FILE = '/Users/wangxiaoping/fayzedu/novasys/playwright/test-debug-log.txt';

// Ensure directories exist
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Initialize log file
fs.writeFileSync(LOG_FILE, `=== Nova Admin Debug Playwright Test ===\nStarted at: ${new Date().toISOString()}\n\n`);

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

async function testLoginWithDebug(browser) {
    log('\n=== Testing Login Page with Debug ===');
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const allConsoleMessages = [];
    const allNetworkRequests = [];
    const allResponseBodies = [];
    let captchaId = '';
    let captchaEnabled = false;
    
    // Capture all console messages
    page.on('console', msg => {
        const msgText = `[${msg.type()}] ${msg.text()}`;
        allConsoleMessages.push(msgText);
        log(`Console: ${msgText}`);
    });
    
    // Capture all network requests
    page.on('request', request => {
        const reqInfo = {
            url: request.url(),
            method: request.method(),
            headers: request.headers()
        };
        allNetworkRequests.push(reqInfo);
    });
    
    // Capture all responses
    page.on('response', async response => {
        const url = response.url();
        const status = response.status();
        let body = '';
        try {
            body = await response.text();
        } catch (e) {
            body = '(could not read body)';
        }
        const respInfo = {
            url,
            status,
            body: body.substring(0, 500)
        };
        allResponseBodies.push(respInfo);
        log(`Response: ${status} - ${url}`);
        if (body.length < 500) {
            log(`  Body: ${body}`);
        }
    });
    
    // Capture network errors
    page.on('requestfailed', request => {
        logError(`Network failed: ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    try {
        log('Navigating to login page...');
        await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
        await captureScreenshot(page, 'debug-login-page');
        
        // Wait a bit for any async operations
        await page.waitForTimeout(2000);
        
        // Check captcha configuration
        log('Checking captcha configuration...');
        try {
            const captchaResp = await fetch(BACKEND_URL + 'captcha');
            const captchaData = await captchaResp.json();
            log(`Captcha response: ${JSON.stringify(captchaData)}`);
            if (captchaData.data) {
                captchaId = captchaData.data.captchaId || '';
                captchaEnabled = captchaData.data.enabled !== false;
            }
        } catch (e) {
            logError(`Failed to get captcha: ${e.message}`);
        }
        
        // Find and fill login form
        log('Filling login form...');
        
        // Try different selectors for username
        const usernameInput = await page.$('input[type="text"]');
        const passwordInput = await page.$('input[type="password"]');
        
        // Try to find captcha input if enabled
        const captchaInput = await page.$('input[placeholder*="证码"], input[placeholder*="码"], input[id*="captcha"], input[name*="captcha"]');
        
        const loginButton = await page.$('button[type="submit"], button.n-button--primary, button:has-text("登录")');
        
        log(`Found elements - Username: ${!!usernameInput}, Password: ${!!passwordInput}, Captcha: ${!!captchaInput}, Button: ${!!loginButton}`);
        
        if (usernameInput && passwordInput && loginButton) {
            await usernameInput.fill('admin');
            await passwordInput.fill('123456');
            
            // Fill captcha if present
            if (captchaInput) {
                await captchaInput.fill('1234');
                log('Filled captcha');
            }
            
            // Click login button
            log('Clicking login button...');
            await loginButton.click();
            
            // Wait for response
            await page.waitForTimeout(5000);
            
            const currentUrl = page.url();
            log(`After login, URL: ${currentUrl}`);
            
            await captureScreenshot(page, 'debug-after-login');
            
            // Check for token in localStorage
            const localStorage = await page.evaluate(() => {
                return {
                    accessToken: localStorage.getItem('accessToken'),
                    refreshToken: localStorage.getItem('refreshToken'),
                    userInfo: localStorage.getItem('userInfo')
                };
            });
            log(`LocalStorage: ${JSON.stringify(localStorage)}`);
            
            if (localStorage.accessToken) {
                log('Login SUCCESS - Token stored');
            } else {
                log('Login FAILED - No token found');
            }
        }
        
    } catch (e) {
        logError(`Login test error: ${e.message}`);
        logError(e.stack);
    }
    
    await context.close();
    
    // Save detailed logs
    const debugInfo = {
        timestamp: new Date().toISOString(),
        consoleMessages: allConsoleMessages,
        networkRequests: allNetworkRequests,
        responses: allResponseBodies
    };
    
    fs.writeFileSync('/Users/wangxiaoping/fayzedu/novasys/playwright/debug-info.json', JSON.stringify(debugInfo, null, 2));
    log('Debug info saved to debug-info.json');
}

async function testAuthenticatedPages(browser) {
    log('\n=== Testing Authenticated Pages ===');
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // First, get token via API
    log('Getting token via API...');
    try {
        const loginResp = await fetch(BACKEND_URL + 'login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: '123456',
                code: '1234',
                uuid: ''
            })
        });
        const loginData = await loginResp.json();
        log(`Login API response: ${JSON.stringify(loginData)}`);
        
        if (loginData.data && loginData.data.accessToken) {
            const token = loginData.data.accessToken;
            
            // Set token in localStorage
            await page.goto(BASE_URL);
            await page.evaluate((t) => {
                localStorage.setItem('accessToken', t);
            }, token);
            
            log('Token set in localStorage');
            
            // Test dashboard
            log('Testing dashboard...');
            await page.goto(BASE_URL + '#/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
            await page.waitForTimeout(2000);
            await captureScreenshot(page, 'debug-dashboard');
            
            // Test user management
            log('Testing user management...');
            await page.goto(BASE_URL + '#/system/user', { waitUntil: 'networkidle', timeout: 30000 });
            await page.waitForTimeout(2000);
            await captureScreenshot(page, 'debug-user-management');
            
            // Check for tables
            const tables = await page.$$('table, .n-data-table');
            log(`Found ${tables.length} tables/data-tables on user management page`);
            
            // Get page content to check for data
            const pageText = await page.textContent('body');
            if (pageText.includes('暂无数据') || pageText.includes('空')) {
                log('Page shows empty state');
            } else {
                log('Page has data');
            }
        }
    } catch (e) {
        logError(`Authenticated test error: ${e.message}`);
    }
    
    await context.close();
}

async function runDebugTests() {
    log('Starting Nova Admin Debug Playwright Tests');
    
    // Launch browser (not headless to see actual window)
    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-blink-features=AutomationControlled']
    });
    
    log('Browser launched successfully');
    
    // Test login page
    await testLoginWithDebug(browser);
    
    // Test authenticated pages
    await testAuthenticatedPages(browser);
    
    // Close browser
    await browser.close();
    
    log(`\nDebug test completed at: ${new Date().toISOString()}`);
    log(`Log file: ${LOG_FILE}`);
}

runDebugTests().catch(console.error);
