const { chromium } = require('playwright');

async function testDirectApi() {
    const browser = await chromium.launch({
        headless: false
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    page.on('request', request => {
        console.log('REQUEST:', request.method(), request.url());
        console.log('  Headers:', JSON.stringify(request.headers(), null, 2));
    });
    
    page.on('response', response => {
        console.log('RESPONSE:', response.status(), response.url());
    });
    
    page.on('console', msg => {
        console.log('CONSOLE:', msg.type(), msg.text());
    });
    
    try {
        await page.goto('http://localhost:9980/', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);
        
        const usernameInput = await page.$('input[placeholder="输入账号"]');
        const passwordInput = await page.$('input[placeholder="输入密码"]');
        const loginButton = await page.$('button:has-text("登录")');
        
        if (usernameInput && passwordInput && loginButton) {
            await usernameInput.fill('admin');
            await passwordInput.fill('123456');
            await loginButton.click();
            await page.waitForTimeout(3000);
        }
        
    } catch (e) {
        console.error('Error:', e.message);
    }
    
    await browser.close();
}

testDirectApi();
