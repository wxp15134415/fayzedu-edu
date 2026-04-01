<script setup lang="ts">
import { useBoolean } from '@/hooks'
import { fetchDeptOptions, fetchRoleList, createUser, updateUser } from '@/service'

interface Props {
  modalName?: string
}

const {
  modalName = '',
} = defineProps<Props>()

const emit = defineEmits<{
  open: []
  close: []
  refresh: []
}>()

const { bool: modalVisible, setTrue: showModal, setFalse: hiddenModal } = useBoolean(false)

const { bool: submitLoading, setTrue: startLoading, setFalse: endLoading } = useBoolean(false)

const formDefault: Entity.User = {
  username: '',
  password: '',
  nickName: '',
  email: '',
  phone: '',
  roleIds: [],
  status: 1,
  deptId: undefined,
}
const formModel = ref<Entity.User>({ ...formDefault })

type ModalType = 'add' | 'view' | 'edit'
const modalType = shallowRef<ModalType>('add')
const modalTitle = computed(() => {
  const titleMap: Record<ModalType, string> = {
    add: '添加',
    view: '查看',
    edit: '编辑',
  }
  return `${titleMap[modalType.value]}${modalName}`
})

// 部门选项 - 使用静态数据
const deptOptions = ref<{label: string, value: number}[]>([
  { label: '福安一中', value: 1 },
  { label: '教务处', value: 2 },
  { label: '政教处', value: 3 },
  { label: '总务处', value: 4 },
  { label: '办公室', value: 5 },
  { label: '高一', value: 6 },
  { label: '高二', value: 7 },
  { label: '高三', value: 8 },
  { label: '教师', value: 12 },
  { label: '学生', value: 13 },
])

async function loadDeptOptions() {
  // 使用静态数据
}

async function openModal(type: ModalType = 'add', data: any) {
  emit('open')
  modalType.value = type
  showModal()
  getRoleList()
  loadDeptOptions()
  const handlers = {
    async add() {
      formModel.value = { ...formDefault }
    },
    async view() {
      if (!data)
        return
      formModel.value = { ...data, roleIds: data.roles?.map((r: any) => r.id) || [] }
    },
    async edit() {
      if (!data)
        return
      formModel.value = { ...data, roleIds: data.roles?.map((r: any) => r.id) || [] }
    },
  }
  await handlers[type]()
}

function closeModal() {
  hiddenModal()
  endLoading()
  emit('close')
}

defineExpose({
  openModal,
})

const formRef = ref()
async function submitModal() {
  await formRef.value?.validate()
  startLoading()
  
  try {
    const submitData = { ...formModel.value }
    
    // 编辑模式下密码为空则不修改
    if (modalType.value === 'edit' && !submitData.password) {
      delete submitData.password
    }
    
    // 提取角色ID数组
    if (submitData.roleIds && submitData.roleIds.length > 0) {
      submitData.roleIds = submitData.roleIds.map((r: any) => {
        if (typeof r === 'number') return r
        return r.value || r
      })
    }
    
    // 编辑模式只发送后端需要的字段
    if (modalType.value === 'edit') {
      const allowedFields = ['nickName', 'email', 'phone', 'gender', 'status', 'remark', 'deptId', 'roleIds', 'updateTime']
      const filteredData: any = {}
      for (const key of allowedFields) {
        if (submitData[key] !== undefined) {
          // 转换为 snake_case
          const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
          filteredData[snakeKey] = submitData[key]
        }
      }
      console.log('submitData:', filteredData)
      const result = await updateUser(formModel.value.id, filteredData)
      if (result.isSuccess) {
        window.$message.success('编辑成功')
        emit('refresh')
        closeModal()
      } else {
        window.$message.error(result.message || '编辑失败')
        endLoading()
      }
    } else if (modalType.value === 'add') {
      const result = await createUser(submitData)
      if (result.isSuccess) {
        window.$message.success('添加成功')
        emit('refresh')
        closeModal()
      } else {
        window.$message.error(result.message || '添加失败')
        endLoading()
      }
    } else if (modalType.value === 'view') {
      closeModal()
    }
  } catch (error: any) {
    window.$message.error(error.message || '操作失败')
    endLoading()
  }
}

const rules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: 'blur',
    min: 5,
    max: 30,
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: 'blur',
    min: 6,
    max: 30,
  },
}

// 角色选项 - 必须与数据库 sys_role 表的 id 一致
const roleOptions = ref<{label: string, value: number}[]>([
  { label: '超级管理员', value: 1 },
  { label: '管理员', value: 4 },
  { label: '教师', value: 5 },
  { label: '学生', value: 3 },
])

async function getRoleList() {
  // 使用静态数据
}
</script>

<template>
  <n-modal
    v-model:show="modalVisible"
    :mask-closable="false"
    preset="card"
    :title="modalTitle"
    class="w-700px"
    :segmented="{
      content: true,
      action: true,
    }"
  >
    <n-form ref="formRef" :rules="rules" label-placement="top" :model="formModel" :label-width="80" :disabled="modalType === 'view'">
      <n-form-item label="用户名" path="username">
        <n-input v-model:value="formModel.username" placeholder="请输入用户名" />
      </n-form-item>
      <n-form-item v-if="modalType === 'add'" label="密码" path="password">
        <n-input v-model:value="formModel.password" type="password" placeholder="请输入密码" />
      </n-form-item>
      <n-form-item v-if="modalType === 'edit'" label="密码">
        <n-input v-model:value="formModel.password" type="password" placeholder="留空则不修改" />
      </n-form-item>
      <n-form-item label="昵称" path="nickName">
        <n-input v-model:value="formModel.nickName" placeholder="请输入昵称" />
      </n-form-item>
      <n-form-item label="部门" path="deptId">
        <n-select
          v-model:value="formModel.deptId"
          clearable
          filterable
          placeholder="请选择部门"
          :options="deptOptions"
        />
      </n-form-item>
      <n-form-item label="角色" path="roleIds">
        <n-select
          v-model:value="formModel.roleIds" multiple filterable
          placeholder="请选择角色"
          :options="roleOptions"
        />
      </n-form-item>
      <n-form-item label="状态" path="status">
        <n-switch
          v-model:value="formModel.status"
          :checked-value="1" :unchecked-value="0"
        >
          <template #checked>
            正常
          </template>
          <template #unchecked>
            停用
          </template>
        </n-switch>
      </n-form-item>
    </n-form>
    <template #action>
      <n-space justify="center">
        <n-button @click="closeModal">
          取消
        </n-button>
        <n-button type="primary" :loading="submitLoading" @click="submitModal">
          提交
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
