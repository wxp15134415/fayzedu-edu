import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In, Not, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm'
import { ExamArrangement, ExamVenue, ExamRoom, ExamSession, Student, StudentGroup, Exam } from '@/entities'

@Injectable()
export class ExamArrangementService {
  constructor(
    @InjectRepository(ExamArrangement)
    private arrangementRepository: Repository<ExamArrangement>,
    @InjectRepository(ExamVenue)
    private venueRepository: Repository<ExamVenue>,
    @InjectRepository(ExamRoom)
    private roomRepository: Repository<ExamRoom>,
    @InjectRepository(ExamSession)
    private sessionRepository: Repository<ExamSession>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(StudentGroup)
    private studentGroupRepository: Repository<StudentGroup>
  ) {}

  async findAll(query: any) {
    const { page = 1, pageSize = 10, keyword, examId, sessionId, venueId, roomId } = query
    const where: any = {}

    if (examId) where.examId = examId
    if (sessionId) where.sessionId = sessionId
    if (venueId) where.venueId = venueId
    if (roomId) where.roomId = roomId
    if (keyword) {
      where.ticketNo = { $like: `%${keyword}%` }
    }

    const [list, total] = await this.arrangementRepository.findAndCount({
      where,
      relations: ['exam', 'session', 'student', 'venue', 'room'],
      order: { seatNo: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    return { list, total, page, pageSize }
  }

  async findOne(id: number) {
    const arrangement = await this.arrangementRepository.findOne({
      where: { id },
      relations: ['exam', 'session', 'student', 'venue', 'room']
    })
    if (!arrangement) {
      throw new NotFoundException('编排记录不存在')
    }
    return arrangement
  }

  async create(data: Partial<ExamArrangement>) {
    const arrangement = this.arrangementRepository.create(data)
    return this.arrangementRepository.save(arrangement)
  }

  async update(id: number, data: Partial<ExamArrangement>) {
    const arrangement = await this.findOne(id)
    Object.assign(arrangement, data)
    return this.arrangementRepository.save(arrangement)
  }

  async delete(id: number) {
    await this.findOne(id)
    await this.arrangementRepository.delete(id)
    return { message: '删除成功' }
  }

  async batchDelete(ids: number[]) {
    await this.arrangementRepository.delete({} as any)
    for (const id of ids) {
      await this.arrangementRepository.delete(id)
    }
    return { message: '批量删除成功' }
  }

  async arrangeStudents(data: {
    examId: number
    sessionId: number
    studentIds: number[]
    venueId: number
  }) {
    const { examId, sessionId, studentIds, venueId } = data

    // 获取该考点下所有考场
    const rooms = await this.roomRepository.find({
      where: { venueId, status: 1 },
      order: { roomCode: 'ASC' }
    })

    if (rooms.length === 0) {
      throw new NotFoundException('该考点下没有可用的考场')
    }

    // 获取学生信息
    const students = await this.studentRepository.findBy({
      id: In(studentIds)
    })

    // 获取场次信息
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId }
    })

    // 按考场容量分配
    const arrangements: ExamArrangement[] = []
    let currentRoomIndex = 0
    let seatNo = 1

    for (const student of students) {
      const room = rooms[currentRoomIndex]
      if (!room) break

      // 生成准考证号: 考点编码 + 考场号 + 座位号
      const ticketNo = `${room.roomCode}${String(seatNo).padStart(3, '0')}`

      const arrangement = this.arrangementRepository.create({
        examId,
        sessionId,
        studentId: student.id,
        venueId,
        roomId: room.id,
        ticketNo,
        seatNo,
        subjectName: session?.sessionName
      })

      const saved = await this.arrangementRepository.save(arrangement)
      arrangements.push(saved)

      // 更新考场当前人数
      room.currentCount = seatNo
      await this.roomRepository.save(room)

      // 检查是否需要换到下一个考场
      if (seatNo >= room.capacity) {
        currentRoomIndex++
        seatNo = 1
      } else {
        seatNo++
      }
    }

    return arrangements
  }

  async getAvailableStudents(examId: number, sessionId: number, gradeId?: number) {
    try {
      // 获取已编排的学生ID
      const arranged = await this.arrangementRepository.find({
        where: { examId, sessionId },
        select: ['studentId']
      })
      const arrangedStudentIds = arranged.map(a => a.studentId)

      // 构建查询
      let students: Student[]

      if (gradeId) {
        // 通过班级关联年级查询
        const query = this.studentRepository
          .createQueryBuilder('student')
          .leftJoin('student.class', 'class')
          .where('class.gradeId = :gradeId', { gradeId })
          .andWhere('student.status = :status', { status: 1 })

        if (arrangedStudentIds.length > 0) {
          query.andWhere('student.id NOT IN (:...arrangedIds)', {
            arrangedIds: arrangedStudentIds
          })
        }

        students = await query.orderBy('student.studentNo', 'ASC').getMany()
      } else {
        const whereCondition: any = { status: 1 }
        if (arrangedStudentIds.length > 0) {
          whereCondition.id = Not(In(arrangedStudentIds))
        }
        students = await this.studentRepository.find({
          where: whereCondition,
          relations: ['class'],
          order: { studentNo: 'ASC' }
        })
      }

      return students
    } catch (error) {
      console.error('getAvailableStudents error:', error)
      return []
    }
  }

  async getPrintData(examId: number, sessionId: number) {
    const arrangements = await this.arrangementRepository.find({
      where: { examId, sessionId },
      relations: ['exam', 'session', 'student', 'venue', 'room'],
      order: { ticketNo: 'ASC' }
    })

    // 按考场分组
    const byRoom: Record<string, any[]> = {}
    for (const arr of arrangements) {
      const roomCode = arr.room?.roomCode || '未知'
      if (!byRoom[roomCode]) {
        byRoom[roomCode] = []
      }
      byRoom[roomCode].push(arr)
    }

    return { arrangements, byRoom }
  }

  async markPrinted(ids: number[]) {
    for (const id of ids) {
      await this.arrangementRepository.update(id, { isPrint: 1 })
    }
    return { message: '标记成功' }
  }

  // ==================== 自动编排扩展功能 ====================

  /**
   * 自动编排（场次优先，随机座位号）
   * @param examId 考试ID
   * @param venueId 考点ID（可选，默认取第一个考点）
   */
  async autoArrange(examId: number, venueId?: number) {
    // 获取考试信息
    const exam = await this.arrangementRepository.manager.findOne(Exam, {
      where: { id: examId }
    })
    if (!exam) {
      throw new NotFoundException('考试不存在')
    }

    // 获取考点和考场
    let venues: ExamVenue[]
    if (venueId) {
      const venue = await this.venueRepository.findOne({ where: { id: venueId } })
      if (!venue) {
        throw new NotFoundException('考点不存在')
      }
      venues = [venue]
    } else {
      venues = await this.venueRepository.find({
        where: { status: 1 },
        order: { id: 'ASC' }
      })
    }

    if (venues.length === 0 || !venues[0]) {
      throw new NotFoundException('没有可用的考点')
    }

    const selectedVenue = venues[0]
    const rooms = await this.roomRepository.find({
      where: { venueId: selectedVenue.id, status: 1 },
      order: { roomCode: 'ASC' }
    })

    if (rooms.length === 0) {
      throw new NotFoundException('该考点下没有可用的考场')
    }

    // 获取考试所有场次（按场次号排序 = 场次优先）
    const sessions = await this.sessionRepository.find({
      where: { examId, status: 1 },
      order: { sessionNo: 'ASC' }
    })

    // 删除该考试已有的编排记录
    await this.arrangementRepository.delete({ examId })
    // 重置考场人数
    for (const room of rooms) {
      room.currentCount = 0
      await this.roomRepository.save(room)
    }

    const results: any[] = []
    const arrangedStudentIds = new Set<number>()

    // 遍历每个场次
    for (const session of sessions) {
      const applicableGroups = session.applicableGroups || []

      // 获取可选学生
      let eligibleStudents: Student[]

      if (applicableGroups.length > 0) {
        // 根据选科组合获取学生
        const studentGroups = await this.studentGroupRepository.find({
          where: { groupId: In(applicableGroups), status: 1 },
          select: ['studentId']
        })
        const studentIds = studentGroups.map(sg => sg.studentId)

        if (studentIds.length === 0) continue

        eligibleStudents = await this.studentRepository.find({
          where: { id: In(studentIds), status: 1 },
          relations: ['grade', 'class']
        })
      } else {
        // 获取该年级所有学生（通过班级关联年级）
        if ((exam as any).gradeId) {
          eligibleStudents = await this.studentRepository
            .createQueryBuilder('student')
            .leftJoin('student.class', 'class')
            .where('class.gradeId = :gradeId', { gradeId: (exam as any).gradeId })
            .andWhere('student.status = :status', { status: 1 })
            .leftJoinAndSelect('student.class', 'c')
            .leftJoinAndSelect('c.grade', 'g')
            .getMany()
        } else {
          eligibleStudents = await this.studentRepository.find({
            where: { status: 1 },
            relations: ['grade', 'class']
          })
        }
      }

      // 过滤掉已编排的学生
      const availableStudents = eligibleStudents.filter(s => !arrangedStudentIds.has(s.id))

      // 随机打乱学生顺序
      this.shuffleArray(availableStudents)

      // 分配到考场
      let currentRoomIndex = 0
      let seatNo = 1

      for (const student of availableStudents) {
        if (currentRoomIndex >= rooms.length) {
          break // 考场不足
        }

        const room = rooms[currentRoomIndex]
        if (!room) break

        // 生成准考证号：考点编码 + 考场号 + 座位号(3位随机)
        const randomSeat = Math.floor(Math.random() * 999) + 1
        const ticketNo = `${selectedVenue.venueCode || 'V'}${room.roomCode}${String(randomSeat).padStart(3, '0')}`

        const arrangement = this.arrangementRepository.create({
          examId,
          sessionId: session.id,
          studentId: student.id,
          venueId: selectedVenue.id,
          roomId: room.id,
          ticketNo,
          seatNo: randomSeat,
          subjectName: session.sessionName,
          arrangeType: 'auto',
          status: 1
        })

        const saved = await this.arrangementRepository.save(arrangement)
        results.push(saved)

        // 记录已编排
        arrangedStudentIds.add(student.id)

        // 更新考场人数
        room.currentCount++
        await this.roomRepository.save(room)

        // 检查是否需要换到下一个考场
        if (room.currentCount >= room.capacity) {
          currentRoomIndex++
          seatNo = 1
        }
      }
    }

    return {
      message: `自动编排完成，共编排 ${results.length} 人`,
      totalArranged: results.length,
      results
    }
  }

  /**
   * 随机座位号
   * @param examId 考试ID
   * @param sessionId 场次ID（可选，不传则重新生成所有场次）
   */
  async randomizeSeatNumbers(examId: number, sessionId?: number) {
    const where: any = { examId }
    if (sessionId) {
      where.sessionId = sessionId
    }

    const arrangements = await this.arrangementRepository.find({
      where,
      relations: ['room']
    })

    for (const arr of arrangements) {
      const randomSeat = Math.floor(Math.random() * 999) + 1
      arr.seatNo = randomSeat

      // 更新准考证号
      const roomCode = arr.room?.roomCode || 'R'
      const venueCode = arr.room?.venue?.venueCode || 'V'
      arr.ticketNo = `${venueCode}${roomCode}${String(randomSeat).padStart(3, '0')}`

      await this.arrangementRepository.save(arr)
    }

    return {
      message: `已重新生成 ${arrangements.length} 个座位号`,
      count: arrangements.length
    }
  }

  /**
   * 检测学生冲突
   * @param examId 考试ID
   */
  async detectConflicts(examId: number) {
    const arrangements = await this.arrangementRepository.find({
      where: { examId, status: 1 },
      relations: ['student', 'session']
    })

    // 按学生分组
    const studentSessions: Record<number, any[]> = {}
    for (const arr of arrangements) {
      if (!studentSessions[arr.studentId]) {
        studentSessions[arr.studentId] = []
      }
      studentSessions[arr.studentId].push(arr)
    }

    // 检测冲突（同学生同一天有多场考试）
    const conflicts: Array<{ studentId: number; studentName: string; sessions: string[] }> = []

    for (const [studentId, arrs] of Object.entries(studentSessions)) {
      if (arrs.length > 1) {
        // 检查是否有时间重叠的场次（同一天的多场）
        const dateSessions = new Map<string, string[]>()
        for (const arr of arrs as any[]) {
          const date = arr.session?.examDate
          const dateKey = date ? new Date(date).toISOString().split('T')[0] : 'unknown'
          if (!dateSessions.has(dateKey)) {
            dateSessions.set(dateKey, [])
          }
          dateSessions.get(dateKey)!.push(arr.session?.sessionName || '未知')
        }

        // 同一天有多场
        for (const [_, sessions] of dateSessions) {
          if (sessions.length > 1) {
            const student = (arrs[0] as any).student
            conflicts.push({
              studentId: +studentId,
              studentName: student?.realName || student?.studentName || '未知',
              sessions: sessions
            })
            break
          }
        }
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts
    }
  }

  /**
   * 手动调整编排
   * @param arrangementId 编排ID
   * @param data 调整数据
   */
  async manualAdjust(arrangementId: number, data: { roomId?: number; seatNo?: number; ticketNo?: string }) {
    const arrangement = await this.arrangementRepository.findOne({
      where: { id: arrangementId },
      relations: ['room']
    })

    if (!arrangement) {
      throw new NotFoundException('编排记录不存在')
    }

    if (data.roomId) {
      arrangement.roomId = data.roomId
    }
    if (data.seatNo) {
      arrangement.seatNo = data.seatNo
    }
    if (data.ticketNo) {
      arrangement.ticketNo = data.ticketNo
    }
    arrangement.arrangeType = 'manual'

    return this.arrangementRepository.save(arrangement)
  }

  /**
   * 编排预览
   * @param examId 考试ID
   */
  async preview(examId: number) {
    const sessions = await this.sessionRepository.find({
      where: { examId, status: 1 },
      order: { sessionNo: 'ASC' }
    })

    const results = await Promise.all(
      sessions.map(async (session) => {
        const arrangements = await this.arrangementRepository.find({
          where: { sessionId: session.id },
          relations: ['student', 'venue', 'room']
        })

        // 按考场分组
        const byRoom: Record<string, any[]> = {}
        for (const arr of arrangements) {
          const roomCode = arr.room?.roomCode || '未知'
          if (!byRoom[roomCode]) {
            byRoom[roomCode] = []
          }
          byRoom[roomCode].push({
            studentId: arr.studentId,
            studentName: arr.student?.name || '',
            ticketNo: arr.ticketNo,
            seatNo: arr.seatNo
          })
        }

        return {
          sessionId: session.id,
          sessionName: session.sessionName,
          totalStudents: arrangements.length,
          rooms: Object.entries(byRoom).map(([roomCode, students]) => ({
            roomCode,
            count: students.length,
            students
          }))
        }
      })
    )

    return results
  }

  /**
   * 导出准考证数据
   * @param examId 考试ID
   * @param sessionId 场次ID（可选）
   */
  async exportTickets(examId: number, sessionId?: number) {
    const where: any = { examId, status: 1 }
    if (sessionId) {
      where.sessionId = sessionId
    }

    const arrangements = await this.arrangementRepository.find({
      where,
      relations: ['exam', 'session', 'student', 'student.class', 'venue', 'room']
    })

    return arrangements.map(arr => ({
      ticketNo: arr.ticketNo,
      studentName: arr.student?.name || '',
      studentNo: arr.student?.studentNo || '',
      className: arr.student?.class?.className || '',
      sessionName: arr.session?.sessionName || '',
      examName: arr.exam?.examName || '',
      venueName: arr.venue?.venueName || '',
      roomCode: arr.room?.roomCode || '',
      seatNo: arr.seatNo,
      examDate: arr.session?.examDate,
      startTime: arr.session?.startTime,
      endTime: arr.session?.endTime
    }))
  }

  /**
   * 导出场次表（按考场）
   * @param examId 考试ID
   * @param sessionId 场次ID
   */
  async exportRoomSeats(examId: number, sessionId: number) {
    const arrangements = await this.arrangementRepository.find({
      where: { examId, sessionId, status: 1 },
      relations: ['student', 'student.class', 'room', 'venue']
    })

    // 按考场分组
    const byRoom: Record<string, any[]> = {}
    for (const arr of arrangements) {
      const roomCode = arr.room?.roomCode || '未知'
      if (!byRoom[roomCode]) {
        byRoom[roomCode] = []
      }
      byRoom[roomCode].push({
        seatNo: arr.seatNo,
        ticketNo: arr.ticketNo,
        studentName: arr.student?.name || '',
        studentNo: arr.student?.studentNo || '',
        className: arr.student?.class?.className || ''
      })
    }

    // 按座位号排序
    for (const roomCode in byRoom) {
      byRoom[roomCode].sort((a, b) => a.seatNo - b.seatNo)
    }

    return {
      sessionId,
      rooms: Object.entries(byRoom).map(([roomCode, students]) => ({
        roomCode,
        venueName: arrangements[0]?.venue?.venueName || '',
        totalSeats: students.length,
        students
      }))
    }
  }

  // 辅助方法：随机打乱数组
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
  }
}
