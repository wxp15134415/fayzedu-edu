import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In, Not } from 'typeorm'
import { ExamSession, ExamArrangement, Student, StudentGroup, SubjectGroup } from '@/entities'

@Injectable()
export class ExamSessionService {
  constructor(
    @InjectRepository(ExamSession)
    private sessionRepository: Repository<ExamSession>,
    @InjectRepository(ExamArrangement)
    private arrangementRepository: Repository<ExamArrangement>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(StudentGroup)
    private studentGroupRepository: Repository<StudentGroup>,
    @InjectRepository(SubjectGroup)
    private subjectGroupRepository: Repository<SubjectGroup>
  ) {}

  async findAll(query: any) {
    const { page = 1, pageSize = 10, keyword, examId } = query
    const where: any = {}

    if (examId) {
      where.examId = examId
    }

    if (keyword) {
      where.sessionName = { $like: `%${keyword}%` }
    }

    const [list, total] = await this.sessionRepository.findAndCount({
      where,
      relations: ['exam', 'subject'],
      order: { sessionNo: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    return { list, total, page, pageSize }
  }

  async findOne(id: number) {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['exam', 'subject']
    })
    if (!session) {
      throw new NotFoundException('场次不存在')
    }
    return session
  }

  async create(data: Partial<ExamSession>) {
    const session = this.sessionRepository.create(data)
    return this.sessionRepository.save(session)
  }

  async update(id: number, data: Partial<ExamSession>) {
    const session = await this.findOne(id)
    Object.assign(session, data)
    return this.sessionRepository.save(session)
  }

  async delete(id: number) {
    await this.findOne(id)
    await this.sessionRepository.delete(id)
    return { message: '删除成功' }
  }

  async batchCreate(examId: number, sessions: any[]) {
    const created: any[] = []
    for (const s of sessions) {
      // 过滤掉空字符串，转换为 null
      const session = this.sessionRepository.create({
        ...s,
        examDate: s.examDate || null,
        startTime: s.startTime || null,
        endTime: s.endTime || null,
        examId
      })
      const saved = await this.sessionRepository.save(session)
      created.push(saved)
    }
    return created
  }

  async updateByExam(examId: number, subjectList: any[]) {
    // 先删除编排记录
    await this.arrangementRepository.delete({ examId })
    // 删除该考试的所有场次
    await this.sessionRepository.delete({ examId })

    // 重新创建场次（只保留前9个）
    const filteredSubjects = subjectList.slice(0, 9)
    const created: any[] = []
    for (let i = 0; i < filteredSubjects.length; i++) {
      const subject = filteredSubjects[i]
      const session = this.sessionRepository.create({
        examId,
        sessionNo: i + 1,
        sessionName: `第${i + 1}场 ${subject.subjectName}`,
        subjectId: subject.id,
        status: 1
      })
      const saved = await this.sessionRepository.save(session)
      created.push(saved)
    }
    return created
  }

  // ==================== 扩展功能 ====================

  /**
   * 获取场次可选学生（根据选科组合过滤）
   * @param sessionId 场次ID
   * @param gradeId 年级ID（可选）
   */
  async getAvailableStudents(sessionId: number, gradeId?: number) {
    // 获取场次信息
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId }
    })
    if (!session) {
      throw new NotFoundException('场次不存在')
    }

    const applicableGroups = session.applicableGroups || []

    // 构建查询条件
    const whereCondition: any = { status: 1 }
    if (gradeId) {
      whereCondition.gradeId = gradeId
    }

    let students: Student[]

    if (applicableGroups.length > 0) {
      // 如果场次绑定了选科组合，只返回这些组合的学生
      const studentGroups = await this.studentGroupRepository.find({
        where: { groupId: In(applicableGroups), status: 1 },
        select: ['studentId']
      })
      const studentIds = studentGroups.map(sg => sg.studentId)

      if (studentIds.length === 0) {
        return []
      }

      whereCondition.id = In(studentIds)
      students = await this.studentRepository.find({
        where: whereCondition,
        relations: ['grade', 'class', 'group'],
        order: { studentNo: 'ASC' }
      })
    } else {
      // 如果没有绑定组合，返回该年级所有学生
      students = await this.studentRepository.find({
        where: whereCondition,
        relations: ['grade', 'class'],
        order: { studentNo: 'ASC' }
      })
    }

    // 排除已编排的学生
    const arranged = await this.arrangementRepository.find({
      where: { examId: session.examId },
      select: ['studentId']
    })
    const arrangedStudentIds = arranged.map(a => a.studentId)

    return students.filter(s => !arrangedStudentIds.includes(s.id))
  }

  /**
   * 获取场次已编排学生数量
   */
  async getArrangedCount(sessionId: number): Promise<number> {
    return this.arrangementRepository.count({
      where: { sessionId, status: 1 }
    })
  }

  /**
   * 检测学生时间冲突
   * @param examId 考试ID
   * @param studentIds 学生ID列表
   */
  async checkConflicts(examId: number, studentIds: number[]) {
    // 获取该考试所有场次
    const sessions = await this.sessionRepository.find({
      where: { examId, status: 1 },
      order: { sessionNo: 'ASC' }
    })

    // 获取该考试已有的编排记录
    const arrangements = await this.arrangementRepository.find({
      where: { examId, status: 1 },
      relations: ['session']
    })

    // 按学生ID分组已有编排
    const studentArrangements: Record<number, ExamArrangement[]> = {}
    for (const arr of arrangements) {
      if (!studentArrangements[arr.studentId]) {
        studentArrangements[arr.studentId] = []
      }
      studentArrangements[arr.studentId].push(arr)
    }

    // 检测冲突
    const conflicts: Array<{ studentId: number; studentName: string; sessionName: string }> = []

    for (const studentId of studentIds) {
      const existingArrangements = studentArrangements[studentId] || []
      if (existingArrangements.length > 0) {
        // 该学生已有编排，返回冲突信息
        const student = await this.studentRepository.findOne({
          where: { id: studentId }
        })
        for (const arr of existingArrangements) {
          conflicts.push({
            studentId,
            studentName: student?.name || '未知',
            sessionName: arr.session?.sessionName || '未知场次'
          })
        }
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts
    }
  }

  /**
   * 检查考场容量
   * @param examId 考试ID
   * @param sessionId 场次ID
   */
  async checkCapacity(examId: number, sessionId?: number) {
    // 获取考试所有场次
    const sessions = await this.sessionRepository.find({
      where: sessionId ? { id: sessionId, examId } : { examId },
      relations: ['subject']
    })

    // 获取考点和考场
    const arrangements = await this.arrangementRepository.find({
      where: { examId },
      relations: ['venue', 'room', 'session'],
      order: { sessionId: 'ASC', roomId: 'ASC', seatNo: 'ASC' }
    })

    // 计算每个场次的已编排人数
    const sessionCounts: Record<number, number> = {}
    for (const arr of arrangements) {
      if (!sessionCounts[arr.sessionId]) {
        sessionCounts[arr.sessionId] = 0
      }
      sessionCounts[arr.sessionId]++
    }

    // 获取场次关联的科目信息
    const results = await Promise.all(
      sessions.map(async (session) => {
        const arrangedCount = sessionCounts[session.id] || 0
        return {
          sessionId: session.id,
          sessionName: session.sessionName,
          subjectName: session.subject?.subjectName || '',
          arrangedCount,
          // 这里可以后续查询适用组合的学生总数
          applicableGroups: session.applicableGroups || []
        }
      })
    )

    return results
  }
}