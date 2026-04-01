const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'http://localhost:9980/';
const SCREENSHOT_DIR = '/Users/wangxiaoping/fayzedu/novasys/playwright/screenshots';
const LOG_FILE = '/Users/wangxiaoping/fayzedu/novasys/playwright/test-menu-log.txt';

if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

fs.writeFileSync(LOG_FILE, `=== Menu Page Test ===\nStarted at: ${new Date().toISOString()}\n\n`);

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

async function test() {
    let browser = null;
    const timestamp = Date.now();
    const consoleErrors = [];

    try {
        log('启动浏览器...');
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
                logError('Console: ' + msg.text());
            }
        });

        page.on('pageerror', err => {
            consoleErrors.push(err.message);
            logError('PageError: ' + err.message);
        });

        log('访问前端地址...');
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        log('执行登录...');
        const usernameInput = await page.$('input[type="text"]');
        const passwordInput = await page.$('input[type="password"]');
        
        if (usernameInput) {
            await usernameInput.fill('super');
        }
        if (passwordInput) {
            await passwordInput.fill('123456');
        }

        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) {
            await submitBtn.click();
        } else {
            await page.keyboard.press('Enter');
        }

        await page.waitForTimeout(3000);
        await captureScreenshot(page, 'menu-after-login');

        log('访问菜单管理页面...');
        await page.goto(BASE_URL + '#/setting/menu', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        await captureScreenshot(page, 'menumanagement');

        const hasTable = await page.$('table, .ant-table, .el-table');
        const hasData = await page.$('.ant-table-row, .el-table__row, tr[data-row-key]');
        
        const pageContent = await page.content();
        const is404 = pageContent.includes('404') || pageContent.includes('Not Found');

        log('=== 测试结果 ===');
        log('表格存在: ' + !!hasTable);
        log('数据行存在: ' + !!hasData);
        log('页面404: ' + is404);
        log('控制台错误数: ' + consoleErrors.length);

        if (consoleErrors.length > 0) {
            log('\n控制台错误详情:');
            consoleErrors.forEach(err => logError(err));
        }

        console.log('\n测试完成，浏览器保持打开');
        console.log('按 Ctrl+C 结束');

    } catch (error) {
        logError('测试失败: ' + error.message);
    }
}

test();
