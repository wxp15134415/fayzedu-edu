const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'http://localhost:9980/';
const SCREENSHOT_DIR = '/Users/wangxiaoping/fayzedu/playwright';

async function main() {
    console.log('Starting dictionary page test...\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const consoleErrors = [];
    const consoleWarnings = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
        if (msg.type() === 'warning') {
            consoleWarnings.push(msg.text());
        }
    });

    page.on('pageerror', error => {
        consoleErrors.push(error.message);
    });

    try {
        console.log('1. Opening login page...');
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        
        console.log('2. Waiting for app to load...');
        await page.waitForSelector('#app', { timeout: 30000 });
        await page.waitForTimeout(3000);

        console.log('3. Logging in...');
        await page.fill('input[placeholder="输入账号"]', 'super');
        await page.fill('input[placeholder="输入密码"]', '123456');
        await page.click('button:has-text("登录")');

        await page.waitForURL('**/dashboard/workbench', { timeout: 10000 });
        console.log('4. Login successful!\n');

        // Test dictionary settings page
        console.log('========================================');
        console.log('Testing: /setting/dictionary (字典设置)');
        console.log('========================================');

        await page.goto(BASE_URL + 'setting/dictionary', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        const screenshotPath1 = path.join(SCREENSHOT_DIR, 'dict-setting-page.png');
        await page.screenshot({ path: screenshotPath1, fullPage: true });
        console.log(`Screenshot saved: ${screenshotPath1}`);

        const bodyText1 = await page.textContent('body');
        const has404_1 = bodyText1?.includes('404') || bodyText1?.includes('Not Found');
        console.log(`Page 404: ${has404_1}`);

        // Test dictionary demo page
        console.log('\n========================================');
        console.log('Testing: /demo/dict (字典示例)');
        console.log('========================================');

        await page.goto(BASE_URL + 'demo/dict', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        const screenshotPath2 = path.join(SCREENSHOT_DIR, 'dict-demo-page.png');
        await page.screenshot({ path: screenshotPath2, fullPage: true });
        console.log(`Screenshot saved: ${screenshotPath2}`);

        const bodyText2 = await page.textContent('body');
        const has404_2 = bodyText2?.includes('404') || bodyText2?.includes('Not Found');
        console.log(`Page 404: ${has404_2}`);

        // Summary
        console.log('\n========================================');
        console.log('TEST RESULTS SUMMARY');
        console.log('========================================');
        console.log(`Dictionary Settings (/setting/dictionary):`);
        console.log(`  - Status: ${has404_1 ? '404 ERROR' : 'OK'}`);
        console.log(`\nDictionary Demo (/demo/dict):`);
        console.log(`  - Status: ${has404_2 ? '404 ERROR' : 'OK'}`);

        if (consoleErrors.length > 0) {
            console.log('\n=== Console Errors ===');
            for (const err of consoleErrors) {
                console.log(`ERROR: ${err}`);
            }
        }

        if (consoleWarnings.length > 0) {
            console.log('\n=== Console Warnings ===');
            for (const warn of consoleWarnings) {
                console.log(`WARN: ${warn}`);
            }
        }

    } catch (error) {
        console.error('Test error:', error.message);
    } finally {
        await browser.close();
    }
}

main();
