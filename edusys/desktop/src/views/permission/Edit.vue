<template>
  <div class="permission-edit">
    <el-card>
      <template #header>
        <span>{{ isEdit ? '编辑权限组' : '新增权限组' }}</span>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="权限名称" prop="permissionName">
              <el-input v-model="form.permissionName" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="权限编码" prop="permissionCode">
              <el-input v-model="form.permissionCode" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="描述" prop="permissionDesc">
              <el-input v-model="form.permissionDesc" type="textarea" :rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { createPermission, updatePermission, getPermissionDetail } from '@/api/permission'

const route = useRoute()
const router = useRouter()

const formRef = ref<FormInstance>()
const loading = ref(false)

const isEdit = computed(() => !!route.params.id)
const permissionId = computed(() => Number(route.params.id))

const form = reactive({
  permissionName: '',
  permissionCode: '',
  permissionDesc: ''
})

const rules: FormRules = {
  permissionName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  permissionCode: [{ required: true, message: '请输入权限编码', trigger: 'blur' }]
}

const loadPermissionDetail = async () => {
  if (!isEdit.value) return
  try {
    const res = await getPermissionDetail(permissionId.value)
    Object.assign(form, res)
  } catch (error) {
    console.error('加载权限详情失败', error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (isEdit.value) {
          await updatePermission(permissionId.value, form)
          ElMessage.success('更新成功')
        } else {
          await createPermission(form)
          ElMessage.success('创建成功')
        }
        router.push('/permission')
      } catch (error: any) {
        ElMessage.error(error.message || '保存失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleCancel = () => {
  router.back()
}

onMounted(() => {
  loadPermissionDetail()
})
</script>

<style scoped>
.permission-edit {
  padding: 20px;
  max-width: 600px;
}
</style>
