const { chromium } = require('playwright');

async function testLoginProxy() {
    const browser = await chromium.launch({
        headless: false
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    page.on('request', request => {
        console.log('REQUEST:', request.method(), request.url());
        console.log('  Headers:', JSON.stringify(request.headers(), null, 2).substring(0, 200));
    });
    
    page.on('response', response => {
        console.log('RESPONSE:', response.status(), response.url());
        if (response.status() >= 400) {
            response.text().then(text => {
                console.log('  Error body:', text);
            });
        } else {
            response.text().then(text => {
                console.log('  Success body:', text.substring(0, 200));
            });
        }
    });
    
    try {
        await page.goto('http://localhost:9980/proxy-url/login', { 
            waitUntil: 'networkidle', 
            timeout: 30000 
        });
        await page.waitForTimeout(2000);
        
        console.log('\nTrying POST request manually...');
        
    } catch (e) {
        console.error('Error:', e.message);
    }
    
    await browser.close();
}

testLoginProxy();
