#!/usr/bin/env python3
"""
Playwright 测试脚本 - 验证页面修复
"""
import asyncio
from playwright.async_api import async_playwright
import os

OUTPUT_DIR = "/Users/wangxiaoping/fayzedu/novasys/playwright"

async def main():
    async with async_playwright() as p:
        # 启动 Chromium 浏览器 (非 headless)
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await context.new_page()
        
        print("=" * 60)
        print("开始测试页面修复")
        print("=" * 60)
        
        # 1. 访问登录页面
        print("\n[1] 访问登录页面...")
        await page.goto("http://localhost:9980")
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path=f"{OUTPUT_DIR}/1_login_page.png", full_page=True)
        print(f"  截图保存: {OUTPUT_DIR}/1_login_page.png")
        
        # 2. 登录
        print("\n[2] 登录系统...")
        await page.fill('input[placeholder="请输入用户名"]', 'super')
        await page.fill('input[placeholder="请输入密码"]', '123456')
        await page.click('button[type="submit"]')
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path=f"{OUTPUT_DIR}/2_after_login.png", full_page=True)
        print(f"  截图保存: {OUTPUT_DIR}/2_after_login.png")
        
        # 等待一下让页面完全加载
        await asyncio.sleep(2)
        
        # 3. 测试用户管理页面
        print("\n[3] 测试用户管理页面...")
        # 点击用户管理菜单 (可能需要先找到正确的元素)
        try:
            # 尝试找到用户管理菜单项
            user_menu = page.locator('text=用户管理').first
            await user_menu.click()
            await page.wait_for_load_state("networkidle")
            await asyncio.sleep(2)
            await page.screenshot(path=f"{OUTPUT_DIR}/3_user_management.png", full_page=True)
            print(f"  截图保存: {OUTPUT_DIR}/3_user_management.png")
            print("  用户管理页面测试完成")
        except Exception as e:
            print(f"  用户管理测试失败: {e}")
            await page.screenshot(path=f"{OUTPUT_DIR}/3_user_management_error.png", full_page=True)
        
        # 4. 测试角色管理页面
        print("\n[4] 测试角色管理页面...")
        try:
            role_menu = page.locator('text=角色管理').first
            await role_menu.click()
            await page.wait_for_load_state("networkidle")
            await asyncio.sleep(2)
            await page.screenshot(path=f"{OUTPUT_DIR}/4_role_management.png", full_page=True)
            print(f"  截图保存: {OUTPUT_DIR}/4_role_management.png")
            print("  角色管理页面测试完成")
        except Exception as e:
            print(f"  角色管理测试失败: {e}")
            await page.screenshot(path=f"{OUTPUT_DIR}/4_role_management_error.png", full_page=True)
        
        # 5. 测试菜单管理页面
        print("\n[5] 测试菜单管理页面...")
        try:
            menu_menu = page.locator('text=菜单管理').first
            await menu_menu.click()
            await page.wait_for_load_state("networkidle")
            await asyncio.sleep(2)
            await page.screenshot(path=f"{OUTPUT_DIR}/5_menu_management.png", full_page=True)
            print(f"  截图保存: {OUTPUT_DIR}/5_menu_management.png")
            print("  菜单管理页面测试完成")
        except Exception as e:
            print(f"  菜单管理测试失败: {e}")
            await page.screenshot(path=f"{OUTPUT_DIR}/5_menu_management_error.png", full_page=True)
        
        # 检查控制台错误
        print("\n[6] 检查控制台错误...")
        
        # 收集控制台消息
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        
        # 刷新页面触发新的日志
        await page.reload()
        await asyncio.sleep(3)
        
        if console_messages:
            print("  控制台消息:")
            for msg in console_messages[-20:]:  # 只显示最后20条
                print(f"    {msg}")
        else:
            print("  没有控制台错误")
        
        print("\n" + "=" * 60)
        print("测试完成！所有截图已保存到:")
        print(f"  {OUTPUT_DIR}")
        print("=" * 60)
        
        # 保持浏览器打开
        print("\n浏览器保持打开状态，请手动检查...")
        await asyncio.sleep(10)
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
