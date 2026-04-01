const { chromium } = require('playwright');

async function loginTest() {
    const browser = await chromium.launch({
        headless: false
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const errors = [];
    
    page.on('requestfailed', request => {
        console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
        errors.push(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    page.on('response', response => {
        if (response.status() >= 400) {
            console.log('ERROR RESPONSE:', response.url(), response.status(), response.statusText());
            errors.push(`ERROR RESPONSE: ${response.url()} - ${response.status()} ${response.statusText()}`);
        } else {
            console.log('OK RESPONSE:', response.url(), response.status());
        }
    });
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('CONSOLE ERROR:', msg.text());
            errors.push(`CONSOLE ERROR: ${msg.text()}`);
        }
    });
    
    try {
        await page.goto('http://localhost:9980/', { waitUntil: 'networkidle', timeout: 30000 });
        console.log('Page loaded');
        
        await page.waitForTimeout(2000);
        
        const usernameInput = await page.$('input[placeholder="输入账号"]');
        const passwordInput = await page.$('input[placeholder="输入密码"]');
        const loginButton = await page.$('button:has-text("登录")');
        
        console.log('Found form elements, attempting login...');
        
        if (usernameInput && passwordInput && loginButton) {
            await usernameInput.fill('admin');
            await passwordInput.fill('123456');
            await loginButton.click();
            
            console.log('Clicked login button, waiting for response...');
            
            await page.waitForTimeout(5000);
            
            console.log('Current URL:', page.url());
            console.log('Title:', await page.title());
        }
        
    } catch (e) {
        console.error('Error:', e.message);
    }
    
    console.log('\n=== Summary ===');
    console.log('Errors found:', errors.length);
    errors.forEach(e => console.log('  -', e));
    
    await browser.close();
}

loginTest();
