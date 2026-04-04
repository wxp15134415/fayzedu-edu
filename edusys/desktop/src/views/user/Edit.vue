<template>
  <div class="user-edit">
    <el-card>
      <template #header>
        <span>{{ isEdit ? '编辑用户' : '新增用户' }}</span>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="姓名" prop="realName">
              <el-input v-model="form.realName" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="角色" prop="roleId">
              <el-select v-model="form.roleId" placeholder="请选择角色">
                <el-option
                  v-for="item in roleList"
                  :key="item.id"
                  :label="item.roleName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" v-if="!isEdit">
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" show-password />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="状态" prop="status">
              <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
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
import { createUser, updateUser, getUserDetail, getAllRoles } from '@/api/user'

const route = useRoute()
const router = useRouter()

const formRef = ref<FormInstance>()
const loading = ref(false)
const roleList = ref<any[]>([])

const isEdit = computed(() => !!route.params.id)
const userId = computed(() => Number(route.params.id))

const form = reactive({
  username: '',
  realName: '',
  roleId: undefined as number | undefined,
  password: '',
  phone: '',
  email: '',
  status: 1
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
  password: [{ required: !isEdit.value, message: '请输入密码', trigger: 'blur' }]
}

const loadRoles = async () => {
  try {
    const res = await getAllRoles() as any
    // API 返回 { list: [...] } 格式，需要从中提取数组
    const roles = res?.list || res || []
    // 确保 role 的 id 是数字类型
    roleList.value = (roles as any[]).map((role: any) => ({
      ...role,
      id: Number(role.id)
    }))
    // 如果有角色列表且当前 roleId 为空，则设置默认值
    if (roleList.value.length > 0 && !form.roleId) {
      form.roleId = roleList.value[0].id
    }
  } catch (error) {
    console.error('加载角色失败', error)
  }
}

const loadUserDetail = async () => {
  if (!isEdit.value) return
  try {
    const res = await getUserDetail(userId.value)
    // 确保 roleId 是数字类型
    Object.assign(form, {
      ...res,
      roleId: res.roleId ? Number(res.roleId) : undefined
    })
  } catch (error) {
    console.error('加载用户详情失败', error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (isEdit.value) {
          await updateUser(userId.value, form)
          ElMessage.success('更新成功')
        } else {
          await createUser(form)
          ElMessage.success('创建成功')
        }
        router.push('/user')
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
  loadRoles()
  loadUserDetail()
})
</script>

<style scoped>
.user-edit {
  padding: 20px;
  max-width: 600px;
}
</style>