#!/usr/bin/env python3
"""
Browser Use MCP Server
启动方式: python3 start-mcp-server.py
"""

import os
import sys
import asyncio

# 设置环境变量
os.environ['OPENAI_API_KEY'] = 'fayzwxp'
os.environ['OPENAI_BASE_URL'] = 'http://localhost:9015/v1'

# 导入并启动 MCP Server
sys.argv = ['browser-use', '--mcp']

from browser_use.cli import main as cli_main

async def run():
    await cli_main()

if __name__ == '__main__':
    asyncio.run(run())
