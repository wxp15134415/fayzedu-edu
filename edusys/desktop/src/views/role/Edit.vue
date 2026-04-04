<template>
  <div class="role-edit">
    <el-card>
      <template #header>
        <span>{{ isEdit ? '编辑角色' : '新增角色' }}</span>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="form.roleName" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="角色编码" prop="roleCode">
              <el-input v-model="form.roleCode" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="描述" prop="roleDesc">
              <el-input v-model="form.roleDesc" type="textarea" :rows="3" />
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
import { createRole, updateRole, getRoleDetail } from '@/api/role'

const route = useRoute()
const router = useRouter()

const formRef = ref<FormInstance>()
const loading = ref(false)

const isEdit = computed(() => !!route.params.id)
const roleId = computed(() => Number(route.params.id))

const form = reactive({
  roleName: '',
  roleCode: '',
  roleDesc: ''
})

const rules: FormRules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

const loadRoleDetail = async () => {
  if (!isEdit.value) return
  try {
    const res = await getRoleDetail(roleId.value)
    Object.assign(form, res)
  } catch (error) {
    console.error('加载角色详情失败', error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (isEdit.value) {
          await updateRole(roleId.value, form)
          ElMessage.success('更新成功')
        } else {
          await createRole(form)
          ElMessage.success('创建成功')
        }
        router.push('/role')
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
  loadRoleDetail()
})
</script>

<style scoped>
.role-edit {
  padding: 20px;
  max-width: 600px;
}
</style>
