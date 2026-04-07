#!/bin/bash
# browser-use MCP Server 启动脚本

# 设置 API Key (使用你的本地 LLM API)
export ANTHROPIC_API_KEY="sk-ant-api03-fayzwxp"  # 或者使用其他 LLM
export OPENAI_API_KEY="fayzwxp"

# 使用本地 LLM (需要配置)
# 可以使用 ollama, openai 兼容接口等

# 启动 MCP Server
python3 -m browser_use --mcp