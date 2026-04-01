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

        console.log('直接访问设置页面...');
        await page.goto('http://localhost:9980/setting/menu', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        console.log('菜单管理URL:', page.url());
        const content = await page.content();
        
        if (content.includes('404') || content.includes('Not Found')) {
            console.log('页面404');
        } else {
            console.log('页面正常');
            const title = await page.title();
            console.log('标题:', title);
        }

        console.log('\n按Ctrl+C结束');

    } catch (error) {
        console.error('错误:', error.message);
    }
}

test();
