import { DataSource } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User, Role, Permission, RolePermission, Subject } from './src/entities'

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'wangxiaoping',
  password: '',
  database: 'edusys',
  entities: [User, Role, Permission, RolePermission, Subject],
  synchronize: false
})

async function seed() {
  await dataSource.initialize()
  console.log('数据库连接成功')

  const roleRepo = dataSource.getRepository(Role)
  const permissionRepo = dataSource.getRepository(Permission)
  const userRepo = dataSource.getRepository(User)
  const subjectRepo = dataSource.getRepository(Subject)

  // 1. 创建角色
  const roles = [
    { roleName: '超级管理员', roleCode: 'super_admin', roleDesc: '系统最高权限', isSystem: 1 },
    { roleName: '管理员', roleCode: 'admin', roleDesc: '学校日常管理', isSystem: 1 },
    { roleName: '教师', roleCode: 'teacher', roleDesc: '任课教师', isSystem: 1 },
    { roleName: '学生', roleCode: 'student', roleDesc: '学生账号', isSystem: 1 },
    { roleName: '家长', roleCode: 'parent', roleDesc: '家长账号', isSystem: 1 }
  ]

  for (const role of roles) {
    const existing = await roleRepo.findOne({ where: { roleCode: role.roleCode } })
    if (!existing) {
      await roleRepo.save(role)
      console.log(`创建角色: ${role.roleName}`)
    }
  }

  // 2. 创建权限组
  const permissions = [
    // 系统管理
    { permissionName: '用户管理', permissionCode: 'user:list', permissionDesc: '用户列表' },
    { permissionName: '用户新增', permissionCode: 'user:add', permissionDesc: '新增用户' },
    { permissionName: '用户编辑', permissionCode: 'user:edit', permissionDesc: '编辑用户' },
    { permissionName: '用户删除', permissionCode: 'user:delete', permissionDesc: '删除用户' },
    { permissionName: '角色管理', permissionCode: 'role:list', permissionDesc: '角色列表' },
    { permissionName: '角色新增', permissionCode: 'role:add', permissionDesc: '新增角色' },
    { permissionName: '角色编辑', permissionCode: 'role:edit', permissionDesc: '编辑角色' },
    { permissionName: '权限组管理', permissionCode: 'permission:list', permissionDesc: '权限组列表' },
    { permissionName: '权限组新增', permissionCode: 'permission:add', permissionDesc: '新增权限组' },
    { permissionName: '权限组编辑', permissionCode: 'permission:edit', permissionDesc: '编辑权限组' },
    // 教务管理
    { permissionName: '年级管理', permissionCode: 'grade:list', permissionDesc: '年级列表' },
    { permissionName: '年级新增', permissionCode: 'grade:add', permissionDesc: '新增年级' },
    { permissionName: '年级编辑', permissionCode: 'grade:edit', permissionDesc: '编辑年级' },
    { permissionName: '年级删除', permissionCode: 'grade:delete', permissionDesc: '删除年级' },
    { permissionName: '班级管理', permissionCode: 'class:list', permissionDesc: '班级列表' },
    { permissionName: '班级新增', permissionCode: 'class:add', permissionDesc: '新增班级' },
    { permissionName: '班级编辑', permissionCode: 'class:edit', permissionDesc: '编辑班级' },
    { permissionName: '班级删除', permissionCode: 'class:delete', permissionDesc: '删除班级' },
    { permissionName: '学生管理', permissionCode: 'student:list', permissionDesc: '学生列表' },
    { permissionName: '学生新增', permissionCode: 'student:add', permissionDesc: '新增学生' },
    { permissionName: '学生编辑', permissionCode: 'student:edit', permissionDesc: '编辑学生' },
    { permissionName: '学生删除', permissionCode: 'student:delete', permissionDesc: '删除学生' },
    { permissionName: '科目管理', permissionCode: 'subject:list', permissionDesc: '科目列表' },
    { permissionName: '科目新增', permissionCode: 'subject:add', permissionDesc: '新增科目' },
    { permissionName: '科目编辑', permissionCode: 'subject:edit', permissionDesc: '编辑科目' },
    { permissionName: '科目删除', permissionCode: 'subject:delete', permissionDesc: '删除科目' },
    { permissionName: '成绩管理', permissionCode: 'score:list', permissionDesc: '成绩列表' },
    { permissionName: '成绩录入', permissionCode: 'score:add', permissionDesc: '录入成绩' },
    { permissionName: '成绩编辑', permissionCode: 'score:edit', permissionDesc: '编辑成绩' },
    { permissionName: '成绩删除', permissionCode: 'score:delete', permissionDesc: '删除成绩' },
    { permissionName: '首页', permissionCode: 'dashboard:view', permissionDesc: '查看首页' },
    { permissionName: '基础信息', permissionCode: 'system-info:view', permissionDesc: '查看基础信息' },
    { permissionName: '考试安排', permissionCode: 'exam:list', permissionDesc: '考试安排列表' }
  ]

  for (const perm of permissions) {
    const existing = await permissionRepo.findOne({ where: { permissionCode: perm.permissionCode } })
    if (!existing) {
      await permissionRepo.save(perm)
      console.log(`创建权限组: ${perm.permissionName}`)
    }
  }

  // 3. 创建超级管理员账号
  const adminUser = await userRepo.findOne({ where: { username: 'admin' } })
  if (!adminUser) {
    const superAdminRole = await roleRepo.findOne({ where: { roleCode: 'super_admin' } })
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await userRepo.save({
      username: 'admin',
      password: hashedPassword,
      realName: '超级管理员',
      roleId: superAdminRole!.id,
      status: 1,
      phone: '13800000000',
      email: 'admin@school.com'
    })
    console.log('创建超级管理员账号: admin / admin123')
  }

  // 4. 为超级管理员角色分配所有权限
  const superAdminRole = await roleRepo.findOne({ where: { roleCode: 'super_admin' } })
  const allPermissions = await permissionRepo.find()
  const rolePermRepo = dataSource.getRepository(RolePermission)

  for (const perm of allPermissions) {
    const existing = await rolePermRepo.findOne({
      where: { roleId: superAdminRole!.id, permissionId: perm.id }
    })
    if (!existing) {
      await rolePermRepo.save({
        roleId: superAdminRole!.id,
        permissionId: perm.id
      })
    }
  }
  console.log('为超级管理员分配所有权限')

  // 6. 初始化科目数据
  await dataSource.query('TRUNCATE TABLE subject RESTART IDENTITY CASCADE')

  // 重置序列从1开始
  await dataSource.query(`SELECT setval(pg_get_serial_sequence('subject', 'id'), 1, false)`)

  const subjects = [
    { subjectName: '语文', subjectCode: 'yuwen', credit: 4 },
    { subjectName: '数学', subjectCode: 'shuxue', credit: 4 },
    { subjectName: '英语', subjectCode: 'yingyu', credit: 4 },
    { subjectName: '物理', subjectCode: 'wuli', credit: 3 },
    { subjectName: '化学', subjectCode: 'huaxue', credit: 3 },
    { subjectName: '生物', subjectCode: 'shengwu', credit: 3 },
    { subjectName: '政治', subjectCode: 'zhengzhi', credit: 2 },
    { subjectName: '历史', subjectCode: 'lishi', credit: 2 },
    { subjectName: '地理', subjectCode: 'dili', credit: 2 },
    { subjectName: '体育', subjectCode: 'tiyu', credit: 2 },
    { subjectName: '音乐', subjectCode: 'yinyue', credit: 1 },
    { subjectName: '美术', subjectCode: 'meishu', credit: 1 },
    { subjectName: '信息', subjectCode: 'xinxi', credit: 1 },
    { subjectName: '通用', subjectCode: 'tongyong', credit: 1 },
    { subjectName: '研学', subjectCode: 'yanxue', credit: 1 },
    { subjectName: '劳动', subjectCode: 'laodong', credit: 1 },
    { subjectName: '生涯规划', subjectCode: 'shengya', credit: 1 }
  ]

  for (const subject of subjects) {
    await subjectRepo.save(subject)
    console.log(`创建科目: ${subject.subjectName}`)
  }

  console.log('✅ 初始化数据完成!')
  await dataSource.destroy()
}

seed().catch(console.error)