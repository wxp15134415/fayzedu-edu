import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import router from './router'
import App from './App.vue'
import './style.css'

const app = createApp(App)

// 配置 Element Plus 绿色主题
app.use(ElementPlus, {
  locale: zhCn,
  zIndex: 3000
})

// 自定义主题色 - 绿色
app.config.globalProperties.$ELEMENT = {
  size: 'default',
  zIndex: 3000
}

// 设置 CSS 变量覆盖默认主题色
const style = document.createElement('style')
style.textContent = `
  :root {
    --el-color-primary: #67c23a;
    --el-color-primary-light-3: #85ce61;
    --el-color-primary-light-5: #a9d78d;
    --el-color-primary-light-7: #cce8b4;
    --el-color-primary-light-8: #e1f0d2;
    --el-color-primary-light-9: #f0f7eb;
    --el-color-primary-dark-2: #529b2e;

    /* 侧边栏背景色 - 浅绿色调 */
    --el-menu-bg-color: #f5f7fa;
    --el-menu-hover-bg-color: #e8f5e9;
    --el-menu-text-color: #606266;
    --el-menu-active-color: #67c23a;
    --el-menu-item-hover-fill: #e8f5e9;
  }
`
document.head.appendChild(style)

app.use(createPinia())
app.use(router)

app.mount('#app')