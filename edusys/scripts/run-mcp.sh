#!/bin/bash
# Browser Use MCP Server 启动脚本

export OPENAI_API_KEY="fayzwxp"
export OPENAI_BASE_URL="http://localhost:9015/v1"

python3 -c "
import sys
import asyncio

# 设置 CLI 参数
sys.argv = ['browser-use', '--mcp']

# 导入并启动
from browser_use.cli import main

async def run():
    await main(standalone_mode=False)

asyncio.run(run())
"