const { chromium } = require('playwright');

async function freshTest() {
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
        } else {
            console.log('OK RESPONSE:', response.url(), response.status());
        }
    });
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('CONSOLE ERROR:', msg.text());
        }
    });
    
    try {
        await page.goto('http://localhost:9980/', { waitUntil: 'networkidle', timeout: 30000 });
        console.log('Page loaded');
        
        await page.waitForTimeout(2000);
        
        const usernameInput = await page.$('input[type="text"], input[placeholder*="用户"], input');
        const passwordInput = await page.$('input[type="password"]');
        
        console.log('Found username input:', !!usernameInput);
        console.log('Found password input:', !!passwordInput);
        
        const inputs = await page.$$('input');
        console.log('Total inputs found:', inputs.length);
        
        for (const input of inputs) {
            const placeholder = await input.getAttribute('placeholder');
            const type = await input.getAttribute('type');
            console.log('Input:', type, placeholder);
        }
        
        const buttons = await page.$$('button');
        console.log('Total buttons found:', buttons.length);
        
        for (const button of buttons) {
            const text = await button.textContent();
            console.log('Button:', text?.trim());
        }
        
    } catch (e) {
        console.error('Error:', e.message);
    }
    
    await browser.close();
}

freshTest();
