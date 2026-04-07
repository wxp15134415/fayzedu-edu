/**
 * 飞书机器人 - Claude 对话服务
 * 使用方法: node feishu-bot.js
 */

const axios = require('axios');
const readline = require('readline');

// 配置
const config = {
  // 飞书Webhook地址 (从飞书开放平台获取)
  webhookUrl: process.env.FEISHU_WEBHOOK_URL || 'YOUR_WEBHOOK_URL',

  // Claude API 配置 (使用你的本地API)
  claudeApiUrl: process.env.CLAUDE_API_URL || 'http://localhost:9015/v1/chat/completions',
  claudeApiKey: process.env.CLAUDE_API_KEY || 'fayzwxp',
  claudeModel: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514'
};

// 创建HTTP服务器接收飞书消息
const http = require('http');
const crypto = require('crypto');

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('飞书Claude机器人服务运行中...');
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        // 处理飞书事件
        if (data.type === 'url_verification') {
          // 验证URL
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ challenge: data.challenge }));
          return;
        }

        if (data.type === 'im.message') {
          const message = data.message;
          const userId = message?.sender?.sender_id?.user_id;
          const content = JSON.parse(message?.content || '{}')?.text?.replace(/^@.*?\s/, '').trim();

          if (content) {
            console.log(`收到用户消息: ${content}`);

            // 调用Claude API
            const reply = await callClaude(content);

            // 发送回复
            await sendReply(userId, reply);
          }
        }

        res.writeHead(200);
        res.end('ok');
      } catch (e) {
        console.error('处理消息失败:', e.message);
        res.writeHead(500);
        res.end('error');
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

async function callClaude(message) {
  try {
    const response = await axios.post(config.claudeApiUrl, {
      model: config.claudeModel,
      messages: [
        { role: 'user', content: message }
      ],
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${config.claudeApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data?.choices?.[0]?.message?.content || '抱歉，我没有理解你的问题';
  } catch (e) {
    console.error('Claude API调用失败:', e.message);
    return `调用AI失败: ${e.message}`;
  }
}

async function sendReply(userId, text) {
  if (!config.webhookUrl || config.webhookUrl === 'YOUR_WEBHOOK_URL') {
    console.log('未配置Webhook，无法发送回复');
    return;
  }

  try {
    // 使用飞书机器人发送消息
    const payload = {
      msg_type: 'text',
      content: {
        text: text
      }
    };

    await axios.post(config.webhookUrl, payload);
    console.log('回复已发送');
  } catch (e) {
    console.error('发送回复失败:', e.message);
  }
}

// 启动服务
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🤖 飞书Claude机器人服务已启动: http://localhost:${PORT}`);
  console.log(`📝 请确保已配置FEISHU_WEBHOOK_URL环境变量`);
});

// 交互式测试模式 (本地测试用)
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n💡 提示: 可以设置环境变量后重新运行');
console.log('   FEISHU_WEBHOOK_URL=你的飞书Webhook地址\n');