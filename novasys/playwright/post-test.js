const { chromium } = require('playwright');

async function testPostLogin() {
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
        response.text().then(text => {
            console.log('  Body:', text);
        });
    });
    
    try {
        await page.goto('http://localhost:9980/', { waitUntil: 'networkidle', timeout: 30000 });
        
        console.log('Making fetch POST request...');
        
        const response = await page.evaluate(async () => {
            const res = await fetch('http://localhost:9980/proxy-url/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'admin',
                    password: '123456'
                })
            });
            return {
                status: res.status,
                body: await res.text()
            };
        });
        
        console.log('Result:', response);
        
    } catch (e) {
        console.error('Error:', e.message);
    }
    
    await browser.close();
}

testPostLogin();
