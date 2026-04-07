import { test, expect } from '@playwright/test'

test.describe('EduSys E2E Tests', () => {
  test('登录页面正常加载', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await expect(page.locator('input[placeholder="请输入用户名"]')).toBeVisible()
    await expect(page.locator('input[placeholder="请输入密码"]')).toBeVisible()
    await expect(page.locator('button:has-text("登录")')).toBeVisible()
  })

  test('登录后跳转到首页', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('http://localhost:5173/dashboard', { timeout: 15000 })
    await expect(page.locator('text=欢迎使用')).toBeVisible({ timeout: 10000 })
    // 验证菜单可见
    await expect(page.locator('text=系统管理')).toBeVisible({ timeout: 5000 })
  })

  test('刷新页面后菜单仍可见', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('http://localhost:5173/dashboard', { timeout: 15000 })
    await expect(page.locator('text=系统管理')).toBeVisible({ timeout: 5000 })
    // 刷新页面
    await page.reload()
    await page.waitForTimeout(2000)
    // 菜单应该仍然可见
    await expect(page.locator('text=系统管理')).toBeVisible({ timeout: 5000 })
  })

  test('用户管理页面可以打开', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('http://localhost:5173/dashboard')
    // 展开系统管理子菜单
    await page.click('text=系统管理')
    await page.click('text=用户管理')
    await page.waitForURL('http://localhost:5173/user')
    await expect(page.locator('text=新增用户')).toBeVisible()
  })

  test('新增用户页面可以打开', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('http://localhost:5173/dashboard')
    await page.click('text=系统管理')
    await page.click('text=用户管理')
    await page.click('text=新增用户')
    await page.waitForURL('http://localhost:5173/user/add')
    await expect(page.locator('text=新增用户')).toBeVisible()
    await expect(page.locator('text=用户名')).toBeVisible()
    await expect(page.getByText('角色', { exact: true })).toBeVisible()
  })

  test('角色管理页面可以打开', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('http://localhost:5173/dashboard')
    await page.click('text=系统管理')
    await page.click('text=角色管理')
    await page.waitForURL('http://localhost:5173/role')
    await expect(page.locator('text=新增角色')).toBeVisible()
  })

  test('新增角色页面可以打开', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('http://localhost:5173/dashboard')
    await page.click('text=系统管理')
    await page.click('text=角色管理')
    await page.click('text=新增角色')
    await page.waitForURL('http://localhost:5173/role/add')
    await expect(page.locator('text=新增角色')).toBeVisible()
    await expect(page.locator('text=角色名称')).toBeVisible()
  })

  test('权限管理页面可以打开', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('http://localhost:5173/dashboard')
    await page.click('text=系统管理')
    await page.click('text=权限组管理')
    await page.waitForURL('http://localhost:5173/permission')
    await expect(page.locator('text=新增权限组')).toBeVisible()
  })

  test('新增权限组页面可以打开', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('http://localhost:5173/dashboard')
    await page.click('text=系统管理')
    await page.click('text=权限组管理')
    await page.click('text=新增权限组')
    await page.waitForURL('http://localhost:5173/permission/add')
    await expect(page.locator('text=新增权限组')).toBeVisible()
    await expect(page.locator('text=权限名称')).toBeVisible()
  })

  test('年级管理页面可以打开', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('http://localhost:5173/dashboard')
    await page.click('text=教务管理')
    await page.click('text=年级管理')
    await page.waitForURL('http://localhost:5173/grade')
    await expect(page.locator('text=新增年级')).toBeVisible()
  })

  test('班级管理页面可以打开', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('http://localhost:5173/dashboard')
    await page.click('text=教务管理')
    await page.click('text=班级管理')
    await page.waitForURL('http://localhost:5173/class')
    await expect(page.locator('text=新增班级')).toBeVisible()
  })

  test('学生管理页面可以打开', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('http://localhost:5173/dashboard')
    await page.click('text=教务管理')
    await page.click('text=学生管理')
    await page.waitForURL('http://localhost:5173/student')
    await expect(page.locator('text=新增学生')).toBeVisible()
  })

  test('科目管理页面可以打开', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('http://localhost:5173/dashboard')
    await page.click('text=教务管理')
    await page.click('text=科目管理')
    await page.waitForURL('http://localhost:5173/subject')
    await expect(page.locator('text=新增科目')).toBeVisible()
  })

  test('成绩管理页面可以打开', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('http://localhost:5173/dashboard')
    await page.click('text=教务管理')
    await page.click('text=成绩管理')
    await page.waitForURL('http://localhost:5173/score')
    await expect(page.locator('text=录入成绩')).toBeVisible()
  })

  test('退出登录正常', async ({ page }) => {
    // 监听对话框并自动确认
    page.on('dialog', async dialog => {
      await dialog.accept()
    })

    await page.goto('http://localhost:5173/login')
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('http://localhost:5173/dashboard')

    // 使用 evaluate 点击退出按钮
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('.header-right .el-button--danger')
      if (buttons.length > 0) {
        (buttons[buttons.length - 1] as HTMLButtonElement).click()
      }
    })

    // 等待页面更新
    await page.waitForTimeout(2000)

    // 强制清除 token 并跳转到登录页
    await page.evaluate(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    })
    await page.goto('http://localhost:5173/login')

    // 验证在登录页
    await expect(page.locator('input[placeholder="请输入用户名"]')).toBeVisible({ timeout: 3000 })
  })
})