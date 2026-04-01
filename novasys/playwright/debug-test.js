const { chromium } = require('playwright');

async function debugLogin() {
    const browser = await chromium.launch({
        headless: false
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    page.on('requestfailed', request => {
        console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
    });
    
    page.on('response', response => {
        if (response.status() >= 400) {
            console.log('ERROR RESPONSE:', response.url(), response.status(), response.statusText());
        }
    });
    
    page.on('console', msg => {
        console.log('CONSOLE:', msg.type(), msg.text());
    });
    
    try {
        await page.goto('http://localhost:9980/', { waitUntil: 'networkidle', timeout: 30000 });
        console.log('Page loaded');
        
        await page.waitForTimeout(2000);
        
        const usernameInput = await page.$('input[type="text"], input[placeholder*="用户"]');
        const passwordInput = await page.$('input[type="password"]');
        const loginButton = await page.$('button[type="submit"], button:has-text("登录"), .n-button:has-text("登录")');
        
        if (usernameInput && passwordInput && loginButton) {
            await usernameInput.fill('admin');
            await passwordInput.fill('123456');
            await loginButton.click();
            
            await page.waitForTimeout(5000);
            
            console.log('Current URL:', page.url());
            console.log('Title:', await page.title());
        }
        
        await page.waitForTimeout(3000);
        
    } catch (e) {
        console.error('Error:', e.message);
    }
    
    await browser.close();
}

debugLogin();
