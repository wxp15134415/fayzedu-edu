#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DB_PATH="$SCRIPT_DIR/mem0-sync.db"
SETTINGS_FILE="$SCRIPT_DIR/moss-settings.txt"

echo "========================================"
echo "moss 设定恢复"
echo "========================================"

if [ -f "$SETTINGS_FILE" ]; then
    echo ""
    echo "【核心设定】"
    echo "----------------------------------------"
    cat "$SETTINGS_FILE"
else
    echo "警告: 未找到 moss-settings.txt"
fi

echo ""
echo "【用户沟通偏好】"
echo "----------------------------------------"
COMMUNICATION=$(sqlite3 "$DB_PATH" "SELECT memory FROM memories WHERE categories LIKE '%user_communication%' ORDER BY created_at DESC LIMIT 3;" 2>/dev/null || echo "")
if [ -n "$COMMUNICATION" ]; then
    echo "$COMMUNICATION"
else
    echo "（无记录）"
fi

echo ""
echo "【工作流偏好】"
echo "----------------------------------------"
WORKFLOW=$(sqlite3 "$DB_PATH" "SELECT memory FROM memories WHERE categories LIKE '%agent_workflow_pref%' ORDER BY created_at DESC LIMIT 3;" 2>/dev/null || echo "")
if [ -n "$WORKFLOW" ]; then
    echo "$WORKFLOW"
else
    echo "（无记录）"
fi

echo ""
echo "【用户基本信息】"
echo "----------------------------------------"
USER_INFO=$(sqlite3 "$DB_PATH" "SELECT memory FROM memories WHERE categories LIKE '%user_basic_info%' ORDER BY created_at DESC LIMIT 3;" 2>/dev/null || echo "")
if [ -n "$USER_INFO" ]; then
    echo "$USER_INFO"
else
    echo "（无记录）"
fi

echo ""
echo "========================================"
echo "设定加载完成"
echo "========================================"
