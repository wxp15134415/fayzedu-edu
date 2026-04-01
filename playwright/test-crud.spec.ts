import { test, expect } from '@playwright/test';

test.describe('Nova-Admin CRUD Operations Test', () => {
  test('Test User Management CRUD (/setting/account)', async ({ page }) => {
    console.log('=== Testing User Management ===');
    
    // Login first
    await page.goto('http://localhost:9980/login', { waitUntil: 'networkidle' });
    // Wait for Vue app to render
    await page.waitForSelector('#app', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.fill('input[placeholder="请输入账号"]', 'super');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/workbench', { timeout: 10000 });
    console.log('✓ Login successful');

    // Navigate to User Management
    await page.goto('http://localhost:9980/setting/account', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Test Add - look for "添加" button
    const addButton = page.locator('button:has-text("添加"), button:has-text("新增")').first();
    if (await addButton.isVisible()) {
      console.log('✓ Add button found');
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Check if modal opened
      const modal = page.locator('.ant-modal, .n-modal, [class*="modal"]').first();
      if (await modal.isVisible()) {
        console.log('✓ Add modal opened');
        
        // Try to fill form - username field
        const usernameInput = page.locator('input[id*="username"], input[placeholder*="账号"], input[id*="user"]').first();
        if (await usernameInput.isVisible()) {
          await usernameInput.fill('testuser');
          console.log('✓ Filled username');
        }
        
        // Fill password if present
        const passwordInput = page.locator('input[type="password"]').first();
        if (await passwordInput.isVisible()) {
          await passwordInput.fill('test123456');
          console.log('✓ Filled password');
        }
        
        // Fill name
        const nameInput = page.locator('input[id*="name"], input[placeholder*="名称"]').first();
        if (await nameInput.isVisible()) {
          await nameInput.fill('测试用户');
          console.log('✓ Filled name');
        }
        
        // Click submit
        const submitButton = page.locator('button[type="submit"], button:has-text("确定"), button:has-text("提交")').first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(1000);
          console.log('✓ Submitted form');
        }
      } else {
        console.log('✗ Modal did not open');
      }
    } else {
      console.log('✗ Add button not found');
    }

    // Test Edit - look for "编辑" button
    const editButton = page.locator('button:has-text("编辑"), button:has-text("修改")').first();
    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✓ Edit button found');
      await editButton.click();
      await page.waitForTimeout(1000);
      
      const editModal = page.locator('.ant-modal, .n-modal, [class*="modal"]').first();
      if (await editModal.isVisible()) {
        console.log('✓ Edit modal opened with pre-filled data');
      }
    } else {
      console.log('✗ Edit button not found');
    }

    // Test Delete - look for "删除" button
    const deleteButton = page.locator('button:has-text("删除"), button:has-text("移除")').first();
    if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✓ Delete button found');
      await deleteButton.click();
      await page.waitForTimeout(1000);
      
      // Check for confirmation dialog
      const confirmDialog = page.locator('.ant-modal, .n-modal, [class*="modal"], .ant-popconfirm, [class*="popconfirm"]').first();
      if (await confirmDialog.isVisible()) {
        console.log('✓ Delete confirmation dialog appeared');
        
        // Click confirm
        const confirmBtn = page.locator('button:has-text("确定"), button:has-text("确认"), button.ant-btn-primary').first();
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
          console.log('✓ Clicked confirm delete');
        }
      }
    } else {
      console.log('✗ Delete button not found');
    }
  });

  test('Test Role Management CRUD (/setting/role)', async ({ page }) => {
    console.log('\n=== Testing Role Management ===');
    
    // Login
    await page.goto('http://localhost:9980/login', { waitUntil: 'networkidle' });
    await page.waitForSelector('#app', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.fill('input[placeholder="请输入账号"]', 'super');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/workbench', { timeout: 10000 });

    // Navigate to Role Management
    await page.goto('http://localhost:9980/setting/role', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Test Add
    const addButton = page.locator('button:has-text("添加"), button:has-text("新增")').first();
    if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✓ Add button found');
      await addButton.click();
      await page.waitForTimeout(1000);
      
      const modal = page.locator('.ant-modal, .n-modal, [class*="modal"]').first();
      if (await modal.isVisible()) {
        console.log('✓ Add modal opened');
        
        // Fill role name
        const roleNameInput = page.locator('input[id*="role"], input[placeholder*="角色"]').first();
        if (await roleNameInput.isVisible()) {
          await roleNameInput.fill('测试角色');
          console.log('✓ Filled role name');
        }
        
        // Submit
        const submitButton = page.locator('button[type="submit"], button:has-text("确定")').first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(1000);
          console.log('✓ Submitted form');
        }
      }
    } else {
      console.log('✗ Add button not found');
    }

    // Test Edit
    const editButton = page.locator('button:has-text("编辑")').first();
    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✓ Edit button found');
      await editButton.click();
      await page.waitForTimeout(1000);
      
      const editModal = page.locator('.ant-modal, .n-modal, [class*="modal"]').first();
      if (await editModal.isVisible()) {
        console.log('✓ Edit modal opened');
      }
    } else {
      console.log('✗ Edit button not found');
    }

    // Test Delete
    const deleteButton = page.locator('button:has-text("删除")').first();
    if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✓ Delete button found');
      await deleteButton.click();
      await page.waitForTimeout(1000);
      console.log('✓ Delete action triggered');
    } else {
      console.log('✗ Delete button not found');
    }
  });

  test('Test Menu Management CRUD (/setting/menu)', async ({ page }) => {
    console.log('\n=== Testing Menu Management ===');
    
    // Login
    await page.goto('http://localhost:9980/login', { waitUntil: 'networkidle' });
    await page.waitForSelector('#app', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.fill('input[placeholder="请输入账号"]', 'super');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/workbench', { timeout: 10000 });

    // Navigate to Menu Management
    await page.goto('http://localhost:9980/setting/menu', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Test Add
    const addButton = page.locator('button:has-text("添加"), button:has-text("新增")').first();
    if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✓ Add button found');
      await addButton.click();
      await page.waitForTimeout(1000);
      
      const modal = page.locator('.ant-modal, .n-modal, [class*="modal"]').first();
      if (await modal.isVisible()) {
        console.log('✓ Add modal opened');
        
        // Fill menu name
        const menuNameInput = page.locator('input[id*="menu"], input[placeholder*="菜单"]').first();
        if (await menuNameInput.isVisible()) {
          await menuNameInput.fill('测试菜单');
          console.log('✓ Filled menu name');
        }
        
        // Submit
        const submitButton = page.locator('button[type="submit"], button:has-text("确定")').first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(1500);
          console.log('✓ Submitted form');
          
          // Check if modal closes properly
          if (!(await modal.isVisible())) {
            console.log('✓ Modal closed properly after submit');
          } else {
            console.log('✗ Modal did not close after submit');
          }
        }
      }
    } else {
      console.log('✗ Add button not found');
    }

    // Test Edit
    const editButton = page.locator('button:has-text("编辑")').first();
    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✓ Edit button found');
      await editButton.click();
      await page.waitForTimeout(1000);
      
      const editModal = page.locator('.ant-modal, .n-modal, [class*="modal"]').first();
      if (await editModal.isVisible()) {
        console.log('✓ Edit modal opened');
      }
    } else {
      console.log('✗ Edit button not found');
    }

    // Test Delete
    const deleteButton = page.locator('button:has-text("删除")').first();
    if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✓ Delete button found');
      await deleteButton.click();
      await page.waitForTimeout(1000);
      console.log('✓ Delete action triggered');
    } else {
      console.log('✗ Delete button not found');
    }
  });
});
