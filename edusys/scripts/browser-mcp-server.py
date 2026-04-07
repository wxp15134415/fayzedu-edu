#!/usr/bin/env python3
"""
Browser Use MCP Server - 简化为直接启动
"""
import os
import sys
import asyncio
import signal

# 设置环境变量
os.environ['OPENAI_API_KEY'] = 'fayzwxp'
os.environ['OPENAI_BASE_URL'] = 'http://localhost:9015/v1'

async def start_mcp():
    """启动 MCP Server"""
    from browser_use.mcp.server import main as mcp_main

    print("🚀 Starting Browser Use MCP Server...")
    print(f"   LLM: minimax-m2.5-free @ {os.environ['OPENAI_BASE_URL']}")

    # 启动 MCP 服务
    await mcp_main()

if __name__ == '__main__':
    try:
        asyncio.run(start_mcp())
    except KeyboardInterrupt:
        print("\n👋 MCP Server stopped")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)