const { chromium } = require('playwright');

async function testProxy() {
    const browser = await chromium.launch({
        headless: false
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    page.on('request', request => {
        console.log('REQUEST:', request.method(), request.url());
    });
    
    page.on('response', response => {
        console.log('RESPONSE:', response.status(), response.url());
        if (response.status() >= 400) {
            response.text().then(text => {
                console.log('  Error body:', text);
            });
        }
    });
    
    try {
        await page.goto('http://localhost:9980/proxy-url/captcha', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);
        
    } catch (e) {
        console.error('Error:', e.message);
    }
    
    await browser.close();
}

testProxy();
