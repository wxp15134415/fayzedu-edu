#!/usr/bin/env node

const { chromium } = require('playwright');

async function analyzeWebsite() {
  console.log('连接中...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  // 主要菜单
  const mainMenus = ['阅卷', '分析', '作业', '教学', '校验', '学情', '基础信息', '教务'];

  const results = [];

  for (const menu of mainMenus) {
    console.log(`\n=== 点击: ${menu} ===`);

    try {
      await page.click(`text="${menu}"`, { timeout: 3000 });
      // 等待更长时间让页面加载
      await page.waitForTimeout(3000);

      // 分析页面
      const info = await page.evaluate(() => {
        // 获取所有按钮
        const buttons = [];
        document.querySelectorAll('button, .el-button, [class*="button"]').forEach(b => {
          const t = b.textContent?.trim();
          if (t && t.length > 0 && t.length < 15 && !buttons.includes(t)) {
            buttons.push(t);
          }
        });

        // 获取表格列
        const headers = [];
        document.querySelectorAll('th').forEach(th => {
          const t = th.textContent?.trim();
          if (t && t.length < 20 && !headers.includes(t)) {
            headers.push(t);
          }
        });

        // 获取输入框占位符
        const inputs = [];
        document.querySelectorAll('input').forEach(i => {
          const ph = i.placeholder;
          if (ph) inputs.push(ph);
        });

        // 获取下拉选择器
        const selects = [];
        document.querySelectorAll('.el-select, .el-cascader').forEach(s => {
          const txt = s.textContent?.trim().slice(0, 30);
          if (txt) selects.push(txt);
        });

        // 获取页面主要内容文本片段
        const mainText = document.querySelector('.el-main, main, [class*="main"]')?.textContent?.slice(0, 500) || '';

        return {
          title: document.title,
          url: window.location.href,
          buttons: [...new Set(buttons)].slice(0, 12),
          headers: [...new Set(headers)].slice(0, 15),
          inputs: [...new Set(inputs)],
          selects: [...new Set(selects)].slice(0, 8),
          mainText: mainText.slice(0, 300)
        };
      });

      console.log('标题:', info.title);
      console.log('URL:', info.url);
      console.log('按钮:', info.buttons.join(', '));
      console.log('表格列:', info.headers.join(', '));
      console.log('搜索框:', info.inputs.join(', '));
      console.log('下拉框:', info.selects.slice(0, 5).join(', '));
      console.log('内容:', info.mainText.slice(0, 150));

      results.push({ menu, ...info });

      // 截图
      await page.screenshot({ path: `screenshots/${menu}.png` });

    } catch (e) {
      console.log('失败:', e.message.slice(0, 80));
    }
  }

  console.log('\n========== 分析完成 ==========\n');

  // 输出汇总
  console.log('=== 功能汇总 ===');
  results.forEach(r => {
    console.log(`\n【${r.menu}】`);
    console.log(`  页面: ${r.title}`);
    console.log(`  按钮: ${r.buttons.join(', ')}`);
    console.log(`  列: ${r.headers.join(', ')}`);
    console.log(`  搜索: ${r.inputs.join(', ')}`);
  });

  await browser.close();
  console.log('\n浏览器已关闭');
}

analyzeWebsite().catch(console.error);