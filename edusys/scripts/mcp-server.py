#!/usr/bin/env python3
"""
Browser Use MCP Server - 单次调用完成完整流程
"""
import asyncio
import json
import sys
import os

# 环境变量
os.environ['OPENAI_API_KEY'] = 'fayzwxp'
os.environ['OPENAI_BASE_URL'] = 'http://localhost:9015/v1'

async def main():
    """MCP Server 主循环"""
    from browser_use import Agent, Browser, ChatOpenAI

    # 初始化 LLM
    llm = ChatOpenAI(
        model="minimax-m2.5-free",
        api_key="fayzwxp",
        base_url="http://localhost:9015/v1"
    )
    print("MCP Server ready", file=sys.stderr)

    # 读取请求
    for line in sys.stdin:
        try:
            request = json.loads(line)
            method = request.get("method")
            request_id = request.get("id")

            if method == "tools/list":
                # 返回工具列表
                result = {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "result": {
                        "tools": [
                            {
                                "name": "score_import",
                                "description": "在 EduSys 系统中完成成绩导入完整流程",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "excel_path": {"type": "string", "description": "Excel文件路径"}
                                    },
                                    "required": ["excel_path"]
                                }
                            }
                        ]
                    }
                }
                print(json.dumps(result))

            elif method == "tools/call":
                tool_name = request.get("params", {}).get("name")
                arguments = request.get("params", {}).get("arguments", {})

                if tool_name == "score_import":
                    excel_path = arguments.get("excel_path")

                    # 提取文件名
                    excel_name = os.path.basename(excel_path)

                    # 创建浏览器
                    print(f"正在打开浏览器...", file=sys.stderr)
                    browser = Browser(headless=False)

                    # 任务描述
                    task = f"""在成绩导入页面执行以下操作：
1. 首先访问 http://localhost:5173/score-import 页面
2. 点击「导入成绩」按钮打开导入对话框
3. 在步骤1（选择考试）中，当前应该已选择最新的考试，直接点击「下一步」
4. 在步骤2（选择系统）中，确认已选择「七天」系统，直接点击「下一步」
5. 在步骤3（上传文件）中，找到文件上传区域，点击并选择文件：{excel_path}
6. 等待文件上传完成后，点击「开始解析」按钮
7. 解析完成后，点击「匹配学生」按钮
8. 匹配完成后，点击「保存到临时表」按钮
9. 最后点击「完成」按钮关闭对话框

请逐步执行上述操作，确保每一步都成功完成。如果某一步需要等待，请等待页面稳定后再执行下一步。"""

                    agent = Agent(task=task, llm=llm, browser=browser)
                    print(f"开始执行成绩导入任务...", file=sys.stderr)
                    result = await agent.run()

                    # 关闭浏览器
                    await browser.close()

                    response = {
                        "jsonrpc": "2.0",
                        "id": request_id,
                        "result": {
                            "content": [{"type": "text", "text": f"成绩导入完成: {str(result)[:500]}"}]
                        }
                    }
                    print(json.dumps(response))

        except Exception as e:
            print(json.dumps({"jsonrpc": "2.0", "error": str(e)}), file=sys.stderr)

if __name__ == "__main__":
    asyncio.run(main())