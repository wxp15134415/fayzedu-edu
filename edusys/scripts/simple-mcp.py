#!/usr/bin/env python3
"""
简单的 Browser Use MCP Server
"""
import asyncio
import os

# 配置环境变量
os.environ['OPENAI_API_KEY'] = 'fayzwxp'
os.environ['OPENAI_BASE_URL'] = 'http://localhost:9015/v1'

async def main():
    from mcp.server import Server
    from mcp.types import Tool
    from mcp.server.stdio import stdio_server

    print("🚀 Starting Browser Use MCP Server...")

    # 测试 browser_use 导入
    from browser_use import Agent, Browser, ChatOpenAI

    llm = ChatOpenAI(
        model="minimax-m2.5-free",
        api_key="fayzwxp",
        base_url="http://localhost:9015/v1"
    )
    print("✅ LLM connected")

    # 创建 MCP Server
    server = Server("browser-use")

    @server.list_tools()
    async def list_tools():
        return [
            Tool(
                name="open_browser",
                description="打开浏览器访问指定 URL",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "url": {"type": "string", "description": "要访问的 URL"}
                    },
                    "required": ["url"]
                }
            )
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: dict):
        if name == "open_browser":
            url = arguments.get("url")
            print(f"🌐 Opening: {url}")

            browser = Browser(headless=False)
            agent = Agent(task=f"访问 {url}", llm=llm, browser=browser)
            result = await agent.run()
            await browser.close()

            return [str(result)]
        return ["Unknown tool"]

    print("✅ MCP Server ready!")

    # 运行 server
    async with stdio_server() as streams:
        await server.run(
            streams[0],
            streams[1],
            server.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())