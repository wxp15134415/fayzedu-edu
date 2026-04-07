<template>
  <div class="ai-assistant">
    <!-- 悬浮按钮 -->
    <div class="assistant-toggle" @click="isOpen = !isOpen">
      <el-icon :size="24"><MagicStick /></el-icon>
      <span class="toggle-text">AI助手</span>
    </div>

    <!-- 助手面板 -->
    <transition name="slide">
      <div v-if="isOpen" class="assistant-panel">
        <div class="panel-header">
          <div class="header-title">
            <el-icon :size="20"><MagicStick /></el-icon>
            <span>AI 助手</span>
          </div>
          <el-button text @click="isOpen = false">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>

        <!-- 消息列表 -->
        <div class="messages" ref="messagesRef">
          <div v-if="messages.length === 0" class="empty-state">
            <el-icon :size="48" color="#b0b0b0"><ChatLineRound /></el-icon>
            <p>你好！我是 AI 助手</p>
            <p class="hint">可以用自然语言描述你想做的事情</p>
          </div>
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message', msg.role]"
          >
            <div class="message-avatar">
              <el-avatar :size="32" :icon="msg.role === 'user' ? User : MagicStick" />
            </div>
            <div class="message-content">
              <div class="message-text">{{ msg.content }}</div>
              <div v-if="msg.loading" class="message-loading">
                <el-icon class="is-loading"><Loading /></el-icon>
                执行中...
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <el-input
            v-model="inputText"
            placeholder="输入指令，如：帮我添加一个学生"
            :disabled="loading"
            @keyup.enter="handleSend"
          >
            <template #append>
              <el-button :loading="loading" @click="handleSend">
                <el-icon v-if="!loading"><Promotion /></el-icon>
                发送
              </el-button>
            </template>
          </el-input>
        </div>

        <!-- 示例指令 -->
        <div v-if="messages.length === 0" class="suggestions">
          <div class="suggestion-title">试试说：</div>
          <div class="suggestion-list">
            <el-tag
              v-for="(item, index) in suggestions"
              :key="index"
              @click="handleSuggestion(item)"
              class="suggestion-tag"
            >
              {{ item }}
            </el-tag>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { MagicStick, Close, ChatLineRound, Promotion, User, Loading } from '@element-plus/icons-vue'
import { PageAgent } from 'page-agent'
import { ElMessage } from 'element-plus'

interface Message {
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
}

const isOpen = ref(false)
const inputText = ref('')
const messages = ref<Message[]>([])
const messagesRef = ref<HTMLElement>()
const loading = ref(false)

let agent: PageAgent | null = null

const suggestions = [
  '帮我添加一个学生',
  '查看所有教师列表',
  '导出成绩表',
  '创建新班级'
]

// 初始化 Page Agent
onMounted(async () => {
  // 学校管理系统知识库
  const systemKnowledge = `
你是一个学校管理系统的 AI 助手。

【系统功能】
- 用户管理：管理系统用户账号、角色、权限
- 学生管理：管理学生信息、班级、成绩
- 教师管理：管理教师信息、任课科目
- 成绩管理：录入、查询、统计分析成绩
- 考试管理：创建考试、编排考场、成绩录入
- 班级管理：管理班级信息、年级
- 年级管理：管理年级信息、入学年份
- 科目管理：管理教学科目
- 系统管理：角色、权限、菜单配置

【操作规则】
1. 成绩范围：0-100 分
2. 学号：10位数字
3. 工号：6位数字（教师）
4. 手机号：11位，以 1 开头

【常用操作】
- 添加学生：需要填写姓名、学号、性别、班级
- 录入成绩：需要先选择考试，再选择学生
- 导出数据：支持 Excel 格式导出
- 删除数据前需要确认
`

  // 使用用户配置的 OpenAI API
  agent = new PageAgent({
    model: 'minimax-m2.5-free',
    baseURL: '/v1',
    apiKey: 'fayzwxp',
    language: 'zh-CN',
    instructions: {
      system: systemKnowledge
    }
  })
})

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

// 发送消息
const handleSend = async () => {
  if (!inputText.value.trim() || loading.value) return

  const userInput = inputText.value.trim()
  inputText.value = ''

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: userInput
  })

  // 添加 AI 响应占位
  messages.value.push({
    role: 'assistant',
    content: '',
    loading: true
  })

  loading.value = true
  await scrollToBottom()

  try {
    if (!agent) {
      throw new Error('AI 助手未初始化')
    }

    // 执行指令
    const result = await agent.execute(userInput)

    // 更新最后一条消息
    const lastMsg = messages.value[messages.value.length - 1]
    lastMsg.loading = false
    lastMsg.content = result.data || (result.success ? '执行完成' : '执行失败')

    // 如果成功，显示提示
    if (result.success) {
      ElMessage.success('操作完成')
    } else {
      ElMessage.error('执行失败，请重试')
    }
  } catch (error: any) {
    const lastMsg = messages.value[messages.value.length - 1]
    lastMsg.loading = false
    lastMsg.content = error.message || '执行失败，请重试'
    ElMessage.error(error.message || '执行失败')
  }

  loading.value = false
  await scrollToBottom()
}

// 点击建议
const handleSuggestion = (text: string) => {
  inputText.value = text
  handleSend()
}
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  top: 80px;
  left: 20px;
  z-index: 9999;
}

.assistant-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #58c0fc 0%, #bd45fb 100%);
  color: #fff;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
}

.assistant-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.toggle-text {
  font-size: 14px;
  font-weight: 500;
}

.assistant-panel {
  position: absolute;
  top: 60px;
  left: 0;
  width: 400px;
  height: 500px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(135deg, #58c0fc 0%, #bd45fb 100%);
  color: #fff;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f5f7fa;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  text-align: center;
}

.empty-state p {
  margin: 10px 0 0;
}

.empty-state .hint {
  font-size: 12px;
  color: #c0c4cc;
}

.message {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-content {
  max: 70%;
}

.message.user .message-content {
  text-align: right;
}

.message-text {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.message.user .message-text {
  background: linear-gradient(135deg, #58c0fc 0%, #bd45fb 100%);
  color: #fff;
}

.message.assistant .message-text {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.message-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  color: #909399;
  font-size: 13px;
}

.input-area {
  padding: 12px;
  background: #fff;
  border-top: 1px solid #e6e6e6;
}

.suggestions {
  padding: 0 12px 12px;
}

.suggestion-title {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.suggestion-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-tag:hover {
  transform: scale(1.05);
}

/* 动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 移动端适配 */
@media (max-width: 480px) {
  .assistant-panel {
    width: calc(100vw - 40px);
    right: -10px;
  }

  .assistant-toggle {
    padding: 10px 16px;
  }

  .toggle-text {
    display: none;
  }
}
</style>