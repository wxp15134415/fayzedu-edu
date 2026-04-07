import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import router from './router'
import App from './App.vue'

// 设计系统样式 (顺序很重要：先变量，再组件，最后响应式)
import './styles/tokens.css'
import './styles/components.css'
import './styles/responsive.css'
import './style.css'

const app = createApp(App)

// 配置 Element Plus 紫色主题
app.use(ElementPlus, {
  locale: zhCn,
  zIndex: 3000
})

// 自定义主题色 - 紫色
app.config.globalProperties.$ELEMENT = {
  size: 'default',
  zIndex: 3000
}

// 设置 CSS 变量覆盖默认主题色
const style = document.createElement('style')
style.textContent = `
  :root {
    /* 蓝紫渐变主题色 (Page Agent 风格) */
    --el-color-primary: #58c0fc;
    --el-color-primary-light-3: #89d4ff;
    --el-color-primary-light-5: #aee3ff;
    --el-color-primary-light-7: #d4f1ff;
    --el-color-primary-light-8: #e8f8ff;
    --el-color-primary-light-9: #f5fbff;
    --el-color-primary-dark-2: #3aa8e8;

    /* 侧边栏背景色 - 深色 */
    --el-menu-bg-color: #1d1e1f;
    --el-menu-hover-bg-color: rgba(88, 192, 252, 0.15);
    --el-menu-text-color: #cfd3dc;
    --el-menu-active-color: #58c0fc;
    --el-menu-item-hover-fill: rgba(88, 192, 252, 0.15);
  }
`
document.head.appendChild(style)

app.use(createPinia())
app.use(router)

app.mount('#app')