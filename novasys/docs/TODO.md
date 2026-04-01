# Novasys 待办事项

## 2026-03-31

### 问题修复

- [x] **前端账号添加表单校验规则不完善**
  - 位置：`nova-admin/src/views/setting/account/components/TableModal.vue`
  - 问题：前端只校验必填，未校验用户名最小长度(5)和密码最小长度(6)
  - 影响：用户输入 `test` 时前端校验通过，但后端返回 400 Bad Request
  - 修复：添加 min/max 校验规则
  - 相关文件：
    - `nova-admin/src/views/setting/account/components/TableModal.vue` (已修复)
    - `nova-admin-nest/src/modules/system/user/dto/create-user.dto.ts`（后端验证规则）

- [x] **Vue Transition 警告 - 根节点无法动画**
  - 问题：Vue Transition 不支持组件根节点动画（NFlex/NSpace 渲染为 fragment）
  - 警告信息：`Component inside <Transition> renders non-element root node that cannot be animated`
  - 修复方案：
    1. template 顶层使用 `<div>` 包裹
    2. render 函数中使用 `<div class="flex-center">` 替换 `<NFlex>/<NSpace>`
  - 已修复文件：
    - `nova-admin/src/views/setting/role/index.vue`
    - `nova-admin/src/views/setting/dept/index.vue`
    - `nova-admin/src/views/setting/dictionary/index.vue`
    - `nova-admin/src/views/setting/account/index.vue`

- [x] **i18n 翻译缺失**
  - 问题：Breadcrumb 和 TabBarItem 使用 `route.roleSetting` 和 `route.deptSetting` 但 locale 文件中缺少
  - 警告信息：`[intlify] Not found 'route.roleSetting' key in 'zhCN' locale messages.`
  - 修复：在 `locales/zh_CN.json` 的 `route` 节点下添加:
    - `"roleSetting": "角色设置"`
    - `"deptSetting": "部门设置"`

---

*最后更新: 2026-03-31*
*状态: 全部完成*