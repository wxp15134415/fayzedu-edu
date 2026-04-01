<script setup lang="ts">
import { useBoolean } from '@/hooks'
import { createRole, updateRole } from '@/service'

interface Props {
  modalName?: string
}

const {
  modalName = '角色',
} = defineProps<Props>()

const emit = defineEmits<{
  open: []
  close: []
}>()

const { bool: modalVisible, setTrue: showModal, setFalse: hiddenModal } = useBoolean(false)

const { bool: submitLoading, setTrue: startLoading, setFalse: endLoading } = useBoolean(false)

const formDefault: Entity.Role = {
  roleName: '',
  roleKey: '',
  status: 0,
  remark: '',
}
const formModel = ref<Entity.Role>({ ...formDefault })

type ModalType = 'add' | 'edit'
const modalType = shallowRef<ModalType>('add')
const modalTitle = computed(() => {
  const titleMap: Record<ModalType, string> = {
    add: '添加',
    edit: '编辑',
  }
  return `${titleMap[modalType.value]}${modalName}`
})

const editingId = ref<number>()

async function openModal(type: ModalType = 'add', data?: Entity.Role) {
  emit('open')
  modalType.value = type
  showModal()

  if (type === 'add') {
    formModel.value = { ...formDefault }
    editingId.value = undefined
  }
  else if (type === 'edit' && data) {
    formModel.value = { ...data }
    editingId.value = data.id
  }
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
    if (modalType.value === 'add') {
      const result = await createRole(formModel.value as any)
      if (result.code === 200) {
        window.$message.success('添加角色成功')
        closeModal()
        emit('close')
      }
    }
    else if (modalType.value === 'edit' && editingId.value) {
      const result = await updateRole(editingId.value, formModel.value as any)
      if (result.code === 200) {
        window.$message.success('更新角色成功')
        closeModal()
        emit('close')
      }
    }
  }
  catch (error: any) {
    window.$message.error(error.message || '操作失败')
  }
  finally {
    endLoading()
  }
}

const rules = {
  roleName: {
    required: true,
    message: '请输入角色名称',
    trigger: 'blur',
  },
  roleKey: {
    required: true,
    message: '请输入角色权限字符串',
    trigger: 'blur',
  },
}
</script>

<template>
  <n-modal
    v-model:show="modalVisible"
    :mask-closable="false"
    preset="card"
    :title="modalTitle"
    class="w-600px"
    :segmented="{
      content: true,
      action: true,
    }"
  >
    <n-form ref="formRef" :rules="rules" label-placement="left" :model="formModel" :label-width="120">
      <n-grid :cols="1" :x-gap="18">
        <n-form-item-grid-item label="角色名称" path="roleName">
          <n-input v-model:value="formModel.roleName" />
        </n-form-item-grid-item>
        <n-form-item-grid-item label="角色权限" path="roleKey">
          <n-input v-model:value="formModel.roleKey" />
        </n-form-item-grid-item>
        <n-form-item-grid-item label="角色状态" path="status">
          <n-switch
            v-model:value="formModel.status"
            :checked-value="0"
            :unchecked-value="1"
          >
            <template #checked>
              正常
            </template>
            <template #unchecked>
              停用
            </template>
          </n-switch>
        </n-form-item-grid-item>
        <n-form-item-grid-item label="备注" path="remark">
          <n-input v-model:value="formModel.remark" type="textarea" />
        </n-form-item-grid-item>
      </n-grid>
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
