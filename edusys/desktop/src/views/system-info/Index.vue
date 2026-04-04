<template>
  <div class="system-info">
    <el-card>
      <template #header>
        <span>基础信息设置</span>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="学校名称" prop="schoolName">
              <el-input v-model="form.schoolName" placeholder="请输入学校名称" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="当前学年" prop="currentYear">
              <el-select v-model="form.currentYear" style="width: 100%">
                <el-option label="2025-2026" value="2025-2026" />
                <el-option label="2026-2027" value="2026-2027" />
                <el-option label="2027-2028" value="2027-2028" />
                <el-option label="2028-2029" value="2028-2029" />
                <el-option label="2029-2030" value="2029-2030" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="当前学期" prop="currentSemester">
              <el-select v-model="form.currentSemester" style="width: 100%">
                <el-option label="第一学期" :value="1" />
                <el-option label="第二学期" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入学校地址" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24">
            <el-form-item label="学校简介" prop="description">
              <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入学校简介" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getSystemInfo, updateSystemInfo } from '@/api/systemInfo'

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  schoolName: '',
  currentYear: '2025-2026',
  currentSemester: 1,
  address: '',
  phone: '',
  email: '',
  description: ''
})

const rules: FormRules = {
  schoolName: [{ required: true, message: '请输入学校名称', trigger: 'blur' }],
  currentYear: [{ required: true, message: '请输入学年', trigger: 'blur' }],
  currentSemester: [{ required: true, message: '请选择学期', trigger: 'change' }]
}

const loadData = async () => {
  try {
    const res = await getSystemInfo()
    if (res) {
      Object.assign(form, res)
    }
  } catch (error) {
    console.error('加载基础信息失败', error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await updateSystemInfo(form)
        ElMessage.success('保存成功')
      } catch (error: any) {
        ElMessage.error(error.message || '保存失败')
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.system-info {
  padding: 20px;
  max-width: 800px;
}
</style>