<script setup lang="ts">
import { useBoolean } from '@/hooks'
import { createDept, updateDept, fetchDeptOptions } from '@/service'

interface Props {
  modalName?: string
}

const {
  modalName = '部门',
} = defineProps<Props>()

const emit = defineEmits<{
  open: []
  close: []
}>()

const { bool: modalVisible, setTrue: showModal, setFalse: hiddenModal } = useBoolean(false)

const { bool: submitLoading, setTrue: startLoading, setFalse: endLoading } = useBoolean(false)

const formDefault: Entity.Dept = {
  parentId: 0,
  deptName: '',
  sort: 0,
  leader: '',
  phone: '',
  email: '',
  status: 0,
  remark: '',
}
const formModel = ref<Entity.Dept>({ ...formDefault })

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

// 部门下拉选项
const deptOptions = ref<{ label: string; value: number }[]>([])

async function loadDeptOptions() {
  try {
    const { data } = await fetchDeptOptions()
    // 转换为级联选择器需要的格式
    if (data && Array.isArray(data)) {
      deptOptions.value = convertToSelectOptions(data)
    }
  } catch (error) {
    console.error('加载部门选项失败:', error)
  }
}

// 将树形数据转换为级联选择器格式
function convertToSelectOptions(treeData: any[]): { label: string; value: number }[] {
  const result: { label: string; value: number }[] = []
  
  function traverse(nodes: any[]) {
    for (const node of nodes) {
      result.push({ label: node.label || node.deptName, value: node.value || node.id })
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    }
  }
  
  traverse(treeData)
  return result
}

async function openModal(type: ModalType = 'add', data?: Entity.Dept) {
  emit('open')
  modalType.value = type
  showModal()
  
  // 加载部门选项
  await loadDeptOptions()

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
      const result = await createDept(formModel.value as any)
      if (result.code === 200) {
        window.$message.success('添加部门成功')
        closeModal()
        emit('close')
      }
    }
    else if (modalType.value === 'edit' && editingId.value) {
      const result = await updateDept(editingId.value, formModel.value as any)
      if (result.code === 200) {
        window.$message.success('更新部门成功')
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
  deptName: {
    required: true,
    message: '请输入部门名称',
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
        <n-form-item-grid-item label="上级部门" path="parentId">
          <n-select
            v-model:value="formModel.parentId"
            :options="deptOptions"
            placeholder="请选择上级部门"
            clearable
          />
        </n-form-item-grid-item>
        <n-form-item-grid-item label="部门名称" path="deptName">
          <n-input v-model:value="formModel.deptName" />
        </n-form-item-grid-item>
        <n-form-item-grid-item label="排序" path="sort">
          <n-input-number v-model:value="formModel.sort" :min="0" />
        </n-form-item-grid-item>
        <n-form-item-grid-item label="负责人" path="leader">
          <n-input v-model:value="formModel.leader" />
        </n-form-item-grid-item>
        <n-form-item-grid-item label="联系电话" path="phone">
          <n-input v-model:value="formModel.phone" />
        </n-form-item-grid-item>
        <n-form-item-grid-item label="邮箱" path="email">
          <n-input v-model:value="formModel.email" />
        </n-form-item-grid-item>
        <n-form-item-grid-item label="部门状态" path="status">
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
