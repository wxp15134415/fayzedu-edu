<template>
  <div class="teacher-edit">
    <el-card>
      <template #header>
        <span>{{ isEdit ? '编辑教师' : '新增教师' }}</span>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="工号" prop="teacherNo">
              <el-input v-model="form.teacherNo" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="教工号" prop="teacherId">
              <el-input v-model="form.teacherId" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="form.idCard" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="任教科目" prop="subjectId">
              <el-select v-model="form.subjectId" placeholder="请选择科目" style="width: 100%">
                <el-option v-for="s in subjectList" :key="s.id" :label="s.name" :value="s.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="出生日期" prop="birthDate">
              <el-date-picker v-model="form.birthDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="民族" prop="nation">
              <el-input v-model="form.nation" placeholder="如：汉族" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="籍贯" prop="nativePlace">
              <el-input v-model="form.nativePlace" />
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
            <el-form-item label="学历" prop="education">
              <el-select v-model="form.education" placeholder="请选择学历" style="width: 100%">
                <el-option label="中专" value="中专" />
                <el-option label="高中" value="高中" />
                <el-option label="大专" value="大专" />
                <el-option label="本科" value="本科" />
                <el-option label="硕士" value="硕士" />
                <el-option label="博士" value="博士" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="学位" prop="degree">
              <el-select v-model="form.degree" placeholder="请选择学位" style="width: 100%">
                <el-option label="无" value="无" />
                <el-option label="学士" value="学士" />
                <el-option label="硕士" value="硕士" />
                <el-option label="博士" value="博士" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="入职日期" prop="hireDate">
              <el-date-picker v-model="form.hireDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="岗位" prop="position">
              <el-select v-model="form.position" placeholder="请选择岗位" style="width: 100%">
                <el-option label="专任教师" value="专任教师" />
                <el-option label="行政人员" value="行政人员" />
                <el-option label="教辅人员" value="教辅人员" />
                <el-option label="工勤人员" value="工勤人员" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="职称" prop="title">
              <el-select v-model="form.title" placeholder="请选择职称" style="width: 100%">
                <el-option label="无" value="无" />
                <el-option label="二级教师" value="二级教师" />
                <el-option label="一级教师" value="一级教师" />
                <el-option label="高级教师" value="高级教师" />
                <el-option label="正高级教师" value="正高级教师" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="毕业院校" prop="graduateSchool">
              <el-input v-model="form.graduateSchool" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24">
            <el-form-item label="地址" prop="address">
              <el-input v-model="form.address" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="状态" prop="status">
              <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="在岗" inactive-text="离职" />
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
import { createTeacher, updateTeacher, getTeacher, getSubjectList } from '@/api/teacher'

const route = useRoute()
const router = useRouter()

const formRef = ref<FormInstance>()
const loading = ref(false)
const subjectList = ref<any[]>([])

const isEdit = computed(() => !!route.params.id)
const teacherId = computed(() => Number(route.params.id))

const form = reactive({
  teacherNo: '',
  teacherId: '',
  idCard: '',
  name: '',
  subjectId: undefined as number | undefined,
  gender: '男' as '男' | '女',
  birthDate: '',
  nation: '',
  nativePlace: '',
  phone: '',
  email: '',
  address: '',
  education: '',
  degree: '',
  hireDate: '',
  position: '',
  title: '',
  graduateSchool: '',
  remark: '',
  status: 1 as 0 | 1
})

const rules: FormRules = {
  teacherNo: [
    { required: true, message: '请输入工号', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9]+$/, message: '工号只能包含字母和数字', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在2-20个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  idCard: [
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ]
}

const loadSubjects = async () => {
  try {
    const res: any = await getSubjectList()
    subjectList.value = res || []
  } catch (error) {
    console.error('加载科目失败', error)
  }
}

const loadTeacherDetail = async () => {
  if (!isEdit.value) return
  try {
    const res: any = await getTeacher(teacherId.value)
    Object.assign(form, {
      teacherNo: res.teacherNo || '',
      teacherId: res.teacherId || '',
      idCard: res.idCard || '',
      name: res.name || '',
      subjectId: res.subjectId,
      gender: res.gender === '男' ? '男' : (res.gender === '女' ? '女' : '男'),
      birthDate: res.birthDate || '',
      nation: res.nation || '',
      nativePlace: res.nativePlace || '',
      phone: res.phone || '',
      email: res.email || '',
      address: res.address || '',
      education: res.education || '',
      degree: res.degree || '',
      hireDate: res.hireDate || '',
      position: res.position || '',
      title: res.title || '',
      graduateSchool: res.graduateSchool || '',
      remark: res.remark || '',
      status: res.status === 1 ? 1 : 0
    })
  } catch (error) {
    console.error('加载教师详情失败', error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (isEdit.value) {
          await updateTeacher(teacherId.value, form)
          ElMessage.success('更新成功')
        } else {
          await createTeacher(form)
          ElMessage.success('创建成功')
        }
        router.push('/teacher')
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
  loadSubjects()
  loadTeacherDetail()
})
</script>

<style scoped>
.teacher-edit {
  padding: 20px;
  max-width: 900px;
}
</style>
