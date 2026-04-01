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

        page.on('console', msg => {
            console.log('Console:', msg.type(), msg.text());
        });

        page.on('pageerror', err => {
            console.log('PageError:', err.message);
        });

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
        await page.waitForTimeout(3000);

        console.log('访问菜单管理页面...');
        await page.goto('http://localhost:9980/#/setting/menu', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        const url = page.url();
        console.log('当前URL:', url);

        const title = await page.title();
        console.log('页面标题:', title);

        const content = await page.content();
        
        if (content.includes('404') || content.includes('Not Found') || content.includes('页面不存在')) {
            console.log('检测到404页面');
            const bodyText = await page.$eval('body', el => el.innerText).catch(() => '无法获取');
            console.log('页面内容:', bodyText.substring(0, 500));
        } else {
            console.log('页面内容正常');
            const h1 = await page.$eval('h1, h2, .page-title', el => el.innerText).catch(() => '无标题');
            console.log('页面标题:', h1);
        }

        console.log('\n测试完成，按Ctrl+C结束');

    } catch (error) {
        console.error('错误:', error.message);
    }
}

test();
