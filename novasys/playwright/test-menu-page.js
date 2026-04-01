const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'http://localhost:9980/';
const BACKEND_URL = 'http://localhost:3000/';
const SCREENSHOT_DIR = '/Users/wangxiaoping/fayzedu/novasys/playwright/screenshots';
const LOG_FILE = '/Users/wangxiaoping/fayzedu/novasys/playwright/test-menu-page-log.txt';

if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

fs.writeFileSync(LOG_FILE, `=== Menu Page Full Test ===\nStarted at: ${new Date().toISOString()}\n\n`);

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
    console.error('❌', message);
}

async function captureScreenshot(page, name) {
    const filename = `${SCREENSHOT_DIR}/${name}-${Date.now()}.png`;
    await page.screenshot({ path: filename, fullPage: true });
    log(`Screenshot saved: ${filename}`);
    return filename;
}

async function test() {
    let browser = null;
    const consoleErrors = [];
    const apiErrors = [];
    const apiResponses = [];

    try {
        log('🚀 启动浏览器...');
        browser = await chromium.launch({
            headless: false,
            args: ['--start-maximized']
        });

        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });

        const page = await context.newPage();

        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
                logError('Console Error: ' + msg.text());
            }
        });

        page.on('pageerror', err => {
            consoleErrors.push(err.message);
            logError('PageError: ' + err.message);
        });

        page.on('requestfailed', request => {
            const failure = request.failure();
            if (failure) {
                apiErrors.push(`${request.url()} - ${failure.errorText}`);
                logError(`Request Failed: ${request.url()} - ${failure.errorText}`);
            }
        });

        page.on('response', response => {
            const url = response.url();
            const status = response.status();
            if (url.includes('/api/')) {
                apiResponses.push({ url, status });
            }
            if (status >= 400) {
                apiErrors.push(`${url} - Status ${status}`);
                logError(`API Error: ${url} - Status ${status}`);
            }
        });

        log('📂 访问前端地址...');
        await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);

        log('🔐 执行登录...');
        const loginButton = page.locator('button').filter({ hasText: /登录|Login/i }).first();
        
        if (await loginButton.isVisible()) {
            await page.fill('input[type="text"], input[placeholder*="账"], input[placeholder*="用户"]', 'super');
            await page.fill('input[type="password"], input[placeholder*="密"], input[placeholder*="密码"]', '123456');
            await loginButton.click();
            
            log('⏳ 等待登录跳转...');
            await page.waitForURL(url => !url.toString().includes('login'), { timeout: 15000 });
            log('✅ 登录成功');
        } else {
            log('ℹ️ 似乎已经登录了');
        }
        
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        log(`当前URL: ${currentUrl}`);

        await captureScreenshot(page, 'menu-page-after-login');

        log('📄 访问菜单管理页面 /setting/menu...');
        await page.goto(BASE_URL + 'setting/menu', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(5000);

        const menuUrl = page.url();
        log(`菜单页面URL: ${menuUrl}`);

        await captureScreenshot(page, 'menu-management');

        const pageContent = await page.content();
        const is404 = pageContent.includes('404') || pageContent.includes('Not Found') || pageContent.includes('页面不存在');
        
        const hasTable = await page.$('table, .n-data-table, .ant-table, .el-table');
        const hasMenuData = await page.$('.n-data-table tr, .ant-table-row, .el-table__row, tr[data-row-key]');
        const menuText = await page.$('text=/菜单|menu/i');
        
        const pageTitle = await page.title();
        log(`页面标题: ${pageTitle}`);

        log('\n========== 测试结果 ==========');
        log(`✅ 页面404: ${is404 ? '是' : '否'}`);
        log(`✅ 表格存在: ${!!hasTable}`);
        log(`✅ 菜单数据行: ${!!hasMenuData}`);
        log(`✅ 包含"菜单"文字: ${!!menuText}`);
        log(`✅ 控制台错误数: ${consoleErrors.length}`);
        log(`✅ API错误数: ${apiErrors.length}`);

        if (apiResponses.length > 0) {
            log('\n--- API响应状态 ---');
            const menuApiCalls = apiResponses.filter(r => r.url.includes('menu'));
            menuApiCalls.forEach(r => {
                log(`  ${r.url}: ${r.status}`);
            });
        }

        if (consoleErrors.length > 0) {
            log('\n--- 控制台错误详情 ---');
            consoleErrors.forEach(err => logError(err));
        }

        if (apiErrors.length > 0) {
            log('\n--- API错误详情 ---');
            apiErrors.forEach(err => logError(err));
        }

        log('\n--- 检查后端API ---');
        try {
            const http = require('http');
            
            const backendCheck = await new Promise((resolve) => {
                const req = http.get(BACKEND_URL, (res) => {
                    resolve({ status: res.statusCode, reachable: true });
                });
                req.on('error', () => resolve({ status: null, reachable: false }));
                req.setTimeout(3000, () => {
                    req.destroy();
                    resolve({ status: null, reachable: false, timeout: true });
                });
            });
            
            if (backendCheck.reachable) {
                log(`✅ 后端API可达，状态码: ${backendCheck.status}`);
            } else {
                logError(`❌ 后端API不可达`);
            }
        } catch (e) {
            logError(`❌ 后端API检查失败: ${e.message}`);
        }

        log('\n========================================');
        log('✅ 测试完成！浏览器保持打开');
        log('========================================');
        
        console.log('\n按 Ctrl+C 结束');

    } catch (error) {
        logError('测试失败: ' + error.message);
        logError(error.stack);
    }
}

test();
