#!/usr/bin/env python3
"""
Browser Use MCP Server 启动脚本
"""
import os
import asyncio

# 设置环境变量
os.environ['OPENAI_API_KEY'] = 'fayzwxp'
os.environ['OPENAI_BASE_URL'] = 'http://localhost:9015/v1'

# 使用 uvx 直接启动
import subprocess
import sys

# 尝试使用 uvx 启动
cmd = ['uvx', 'browser-use', '--mcp']
print(f"Starting: {' '.join(cmd)}")

proc = subprocess.Popen(
    cmd,
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    bufsize=1
)

# 实时输出
import threading

def stream_output(pipe, prefix):
    for line in pipe:
        print(f"{prefix}: {line}", end='')

t = threading.Thread(target=stream_output, args=(proc.stdout, "MCP"))
t.start()

proc.wait()
