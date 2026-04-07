#!/usr/bin/env python3
"""Browser Use 测试脚本"""
import asyncio
import os
import sys

# 配置 LLM
os.environ['OPENAI_API_KEY'] = 'fayzwxp'
os.environ['OPENAI_BASE_URL'] = 'http://localhost:9015/v1'

async def main():
    from browser_use import Agent, Browser, ChatOpenAI

    print("🚀 初始化 Browser Use...")

    # 使用本地 LLM
    llm = ChatOpenAI(
        model="minimax-m2.5-free",
        api_key="fayzwxp",
        base_url="http://localhost:9015/v1"
    )

    # 创建浏览器和 Agent
    browser = Browser(headless=False)  # 非 headless 模式可以看到浏览器
    agent = Agent(
        task="访问 http://localhost:5173 并告诉我页面标题是什么",
        llm=llm,
        browser=browser
    )

    print("🌐 正在执行任务...")
    result = await agent.run()

    print("✅ 结果:", result)

    # 保持浏览器打开
    input("按回车键关闭浏览器...")
    await browser.close()

if __name__ == '__main__':
    asyncio.run(main())