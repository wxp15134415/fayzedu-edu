const { chromium } = require('playwright');

async function test() {
    let browser = null;

    try {
        browser = await chromium.launch({
            headless: false,
            args: ['--start-maximized']
        });

        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });

        const page = await context.newPage();

        console.log('访问前端...');
        await page.goto('http://localhost:9980/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        console.log('登录...');
        const inputs = await page.$$('input');
        if (inputs.length >= 2) {
            await inputs[0].fill('super');
            await inputs[1].fill('123456');
            await page.keyboard.press('Enter');
        }
        
        await page.waitForTimeout(5000);
        
        const urlAfterLogin = page.url();
        console.log('登录后URL:', urlAfterLogin);
        
        if (urlAfterLogin.includes('login')) {
            console.log('仍在登录页，尝试直接访问...');
            await page.goto('http://localhost:9980/dashboard', { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);
            console.log('dashboard URL:', page.url());
            
            await page.goto('http://localhost:9980/setting/user', { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);
            console.log('user URL:', page.url());
        }

        console.log('\n按Ctrl+C结束');

    } catch (error) {
        console.error('错误:', error.message);
    }
}

test();
