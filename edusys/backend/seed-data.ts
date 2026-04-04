import { DataSource } from 'typeorm'
import { Grade, Class, Student, Subject, Score } from './src/entities'

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'wangxiaoping',
  password: '',
  database: 'edusys',
  entities: [Grade, Class, Student, Subject, Score],
  synchronize: false
})

async function seedData() {
  await dataSource.initialize()
  console.log('数据库连接成功')

  const gradeRepo = dataSource.getRepository(Grade)
  const classRepo = dataSource.getRepository(Class)
  const studentRepo = dataSource.getRepository(Student)
  const subjectRepo = dataSource.getRepository(Subject)
  const scoreRepo = dataSource.getRepository(Score)

  // 1. 创建年级
  const grades = [
    { gradeName: '一年级', gradeYear: 2024, gradeLevel: '1', description: '小学一年级', status: 1 },
    { gradeName: '二年级', gradeYear: 2024, gradeLevel: '1', description: '小学二年级', status: 1 },
    { gradeName: '三年级', gradeYear: 2024, gradeLevel: '1', description: '小学三年级', status: 1 },
    { gradeName: '高一', gradeYear: 2024, gradeLevel: '3', description: '高中一年级', status: 1 },
    { gradeName: '高二', gradeYear: 2024, gradeLevel: '3', description: '高中二年级', status: 1 },
    { gradeName: '高三', gradeYear: 2024, gradeLevel: '3', description: '高中三年级', status: 1 }
  ]

  const savedGrades = []
  for (const g of grades) {
    const existing = await gradeRepo.findOne({ where: { gradeName: g.gradeName, gradeYear: g.gradeYear } })
    if (!existing) {
      const saved = await gradeRepo.save(g)
      savedGrades.push(saved)
      console.log(`创建年级: ${saved.gradeName}`)
    } else {
      savedGrades.push(existing)
      console.log(`年级已存在: ${existing.gradeName}`)
    }
  }

  // 2. 创建班级
  const classes = [
    { className: '一年级(1)班', gradeId: savedGrades[0].id, description: '一年级一班', status: 1 },
    { className: '一年级(2)班', gradeId: savedGrades[0].id, description: '一年级二班', status: 1 },
    { className: '二年级(1)班', gradeId: savedGrades[1].id, description: '二年级一班', status: 1 },
    { className: '三年级(1)班', gradeId: savedGrades[2].id, description: '三年级一班', status: 1 },
    { className: '高一(1)班', gradeId: savedGrades[3].id, description: '高一火箭班', status: 1 },
    { className: '高一(2)班', gradeId: savedGrades[3].id, description: '高一平行班', status: 1 },
    { className: '高二(1)班', gradeId: savedGrades[4].id, description: '高二理科班', status: 1 },
    { className: '高二(2)班', gradeId: savedGrades[4].id, description: '高二文科班', status: 1 },
    { className: '高三(1)班', gradeId: savedGrades[5].id, description: '高三毕业班', status: 1 }
  ]

  const savedClasses = []
  for (const c of classes) {
    const existing = await classRepo.findOne({ where: { className: c.className } })
    if (!existing) {
      const saved = await classRepo.save(c)
      savedClasses.push(saved)
      console.log(`创建班级: ${saved.className}`)
    } else {
      savedClasses.push(existing)
      console.log(`班级已存在: ${existing.className}`)
    }
  }

  // 3. 创建科目
  const subjects = [
    { subjectName: '语文', subjectCode: 'CHINESE', description: '语文科目', status: 1 },
    { subjectName: '数学', subjectCode: 'MATH', description: '数学科目', status: 1 },
    { subjectName: '英语', subjectCode: 'ENGLISH', description: '英语科目', status: 1 },
    { subjectName: '物理', subjectCode: 'PHYSICS', description: '物理科目', status: 1 },
    { subjectName: '化学', subjectCode: 'CHEMISTRY', description: '化学科目', status: 1 },
    { subjectName: '生物', subjectCode: 'BIOLOGY', description: '生物科目', status: 1 },
    { subjectName: '历史', subjectCode: 'HISTORY', description: '历史科目', status: 1 },
    { subjectName: '地理', subjectCode: 'GEOGRAPHY', description: '地理科目', status: 1 },
    { subjectName: '政治', subjectCode: 'POLITICS', description: '政治科目', status: 1 }
  ]

  const savedSubjects = []
  for (const s of subjects) {
    const existing = await subjectRepo.findOne({ where: { subjectCode: s.subjectCode } })
    if (!existing) {
      const saved = await subjectRepo.save(s)
      savedSubjects.push(saved)
      console.log(`创建科目: ${saved.subjectName}`)
    } else {
      savedSubjects.push(existing)
      console.log(`科目已存在: ${existing.subjectName}`)
    }
  }

  // 4. 创建学生
  const studentNames = [
    '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十',
    '郑十一', '王十二', '刘十三', '陈十四', '杨十五', '黄十六',
    '周十七', '吴十八', '徐十九', '孙二十', '马二十一', '朱二十二'
  ]

  const students = []
  for (let i = 0; i < studentNames.length; i++) {
    const randomClass = savedClasses[Math.floor(Math.random() * savedClasses.length)]
    const student = {
      studentNo: `2024${String(i + 1).padStart(4, '0')}`,
      name: studentNames[i],
      gender: Math.random() > 0.5 ? '男' : '女',
      gradeId: randomClass.gradeId,
      classId: randomClass.id,
      birthDate: '2012-01-01',
      phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      status: 1
    }

    const existing = await studentRepo.findOne({ where: { studentNo: student.studentNo } })
    if (!existing) {
      const saved = await studentRepo.save(student)
      students.push(saved)
      console.log(`创建学生: ${saved.name}`)
    } else {
      students.push(existing)
    }
  }

  // 5. 创建成绩
  const scoreTypes = ['期中考试', '期末考试', '月考']
  const existingScores = await scoreRepo.find()

  if (existingScores.length < 10) {
    for (let i = 0; i < 15; i++) {
      const randomStudent = students[Math.floor(Math.random() * students.length)]
      const randomSubject = savedSubjects[Math.floor(Math.random() * savedSubjects.length)]
      const score = Math.floor(Math.random() * 40) + 60

      const existing = await scoreRepo.findOne({
        where: { studentId: randomStudent.id, subjectId: randomSubject.id }
      })

      if (!existing) {
        await scoreRepo.save({
          studentId: randomStudent.id,
          subjectId: randomSubject.id,
          score: score,
          examDate: new Date(),
          examType: scoreTypes[Math.floor(Math.random() * scoreTypes.length)]
        })
        console.log(`创建成绩: ${randomStudent.name} - ${randomSubject.subjectName} - ${score}分`)
      }
    }
  }

  console.log('\n========== 数据初始化完成 ==========')
  console.log(`年级: ${savedGrades.length} 个`)
  console.log(`班级: ${savedClasses.length} 个`)
  console.log(`科目: ${savedSubjects.length} 个`)
  console.log(`学生: ${students.length} 个`)
  console.log(`成绩: ${(await scoreRepo.find()).length} 条`)

  await dataSource.destroy()
}

seedData().catch(console.error)