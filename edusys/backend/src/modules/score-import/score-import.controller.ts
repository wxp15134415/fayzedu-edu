import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile, Res, ParseIntPipe, Req } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Response, Request } from 'express'
import { Student, ScoreImportTemp, Exam, Score, Class, Grade, ExamScore } from '@/entities'
import { IsNumber, IsOptional, IsString } from 'class-validator'
import axios from 'axios'
import FormData from 'form-data'

class ImportScoreDto {
  @IsNumber()
  examId!: number
  @IsString()
  importBatch!: string
}

class ConfirmImportDto {
  @IsString()
  importBatch!: string
}

@Controller('score-import')
export class ScoreImportController {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(ScoreImportTemp)
    private tempRepository: Repository<ScoreImportTemp>,
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>,
    @InjectRepository(ExamScore)
    private examScoreRepository: Repository<ExamScore>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>
  ) {}

  /**
   * 获取学生列表用于匹配（不带分页，返回所有状态为1的学生）
   */
  @Get('students-for-match')
  async getStudentsForMatch() {
    const students = await this.studentRepository.find({
      where: { status: 1 },
      relations: ['class'],
      order: { id: 'ASC' }
    })

    return students.map(s => ({
      id: s.id,
      studentNo: s.studentNo,
      studentId: s.studentId,
      name: s.name,
      className: s.class?.className,
      classId: s.classId
    }))
  }

  // Python 微服务地址
  private readonly PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:8000'

  /**
   * 解析Excel文件（调用Python微服务）
   */
  @Post('parse')
  @UseInterceptors(FileInterceptor('file'))
  async parseExcel(@UploadedFile() file: any, @Body() body: { system?: string }) {
    try {
      // 将文件转发到 Python 微服务
      const formData = new FormData()
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      })

      // 如果指定了系统，添加到请求中
      if (body?.system) {
        formData.append('system', body.system)
      }

      const response = await axios.post(`${this.PYTHON_API}/python/score/parse`, formData, {
        headers: {
          ...formData.getHeaders()
        }
      })

      return response.data
    } catch (error: any) {
      console.error('解析文件失败:', error.message, error.response?.status)
      const detail = error.response?.data?.detail
      const msg = typeof detail === 'string' ? detail : (detail?.message || JSON.stringify(detail) || error.message)
      return {
        success: false,
        message: '解析文件失败: ' + msg
      }
    }
  }

  /**
   * 预览导入数据（从临时表）
   */
  @Get('preview')
  async previewImport(
    @Query('importBatch') importBatch?: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('status') status?: number,
    @Query('examId') examId?: number
  ) {
    console.log('[previewImport] importBatch:', importBatch, 'examId:', examId, 'status:', status)

    const queryBuilder = this.tempRepository.createQueryBuilder('temp')
      .leftJoinAndSelect('temp.student', 'student')
      .leftJoinAndSelect('student.class', 'class')

    console.log('[previewImport] queryBuilder before where')

    // 构建条件 - 不再强制要求 importBatch
    if (importBatch) {
      queryBuilder.where('temp.importBatch = :importBatch', { importBatch })
    } else {
      queryBuilder.where('1=1')
    }

    // 添加 examId 筛选
    if (examId !== undefined) {
      queryBuilder.andWhere('temp.examId = :examId', { examId })
    }

    if (status !== undefined) {
      queryBuilder.andWhere('temp.status = :status', { status })
    }

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('temp.id', 'ASC')
      .getManyAndCount()

    console.log('[previewImport] list length:', list.length)
    console.log('[previewImport] first item student:', list[0]?.student)

    // 转换数据，确保 student 信息正确序列化
    const transformedList = list.map((item: any) => ({
      ...item,
      student: item.student ? {
        name: item.student.name,
        studentNo: item.student.studentNo,
        class: item.student.class ? {
          className: item.student.class.className
        } : null
      } : null
    }))

    // 统计
    let statsQuery = this.tempRepository
      .createQueryBuilder('temp')
      .select('temp.status', 'status')
      .addSelect('COUNT(*)', 'count')

    if (importBatch) {
      statsQuery = statsQuery.where('temp.importBatch = :importBatch', { importBatch })
    } else {
      statsQuery = statsQuery.where('1=1')
    }

    if (examId !== undefined) {
      statsQuery = statsQuery.andWhere('temp.examId = :examId', { examId })
    }

    if (status !== undefined) {
      statsQuery = statsQuery.andWhere('temp.status = :status', { status })
    }

    const stats = await statsQuery
      .groupBy('temp.status')
      .getRawMany()

    return {
      list: transformedList,
      total,
      page,
      pageSize,
      stats: stats.reduce((acc, s) => {
        acc[s.status] = parseInt(s.count)
        return acc
      }, {} as Record<string, number>)
    }
  }

  /**
   * 确认导入（将临时表数据写入正式成绩表）
   */
  @Post('confirm')
  async confirmImport(@Body() dto: ConfirmImportDto) {
    // 获取所有待确认的数据
    const tempRecords = await this.tempRepository.find({
      where: { importBatch: dto.importBatch, status: 0 }
    })

    if (tempRecords.length === 0) {
      return { success: false, message: '没有待确认的数据' }
    }

    const scoresToInsert: Partial<Score>[] = []
    const errors: string[] = []

    for (const temp of tempRecords) {
      if (!temp.studentId) {
        errors.push(`Row ${temp.id}: 未匹配到学生`)
        continue
      }

      // 检查是否已有该学生该考试的成绩记录
      const existingScore = await this.scoreRepository.findOne({
        where: {
          studentId: temp.studentId,
          examId: temp.examId!
        }
      })

      if (existingScore) {
        // 更新现有记录
        const updateData: Partial<Score> = {
          chinese: temp.chinese,
          chineseRank: temp.chineseRank,
          chineseAssign: temp.chineseAssign,
          chineseRankAssign: temp.chineseRankAssign,
          math: temp.math,
          mathRank: temp.mathRank,
          mathAssign: temp.mathAssign,
          mathRankAssign: temp.mathRankAssign,
          english: temp.english,
          englishRank: temp.englishRank,
          englishAssign: temp.englishAssign,
          englishRankAssign: temp.englishRankAssign,
          physics: temp.physics,
          physicsRank: temp.physicsRank,
          physicsAssign: temp.physicsAssign,
          physicsRankAssign: temp.physicsRankAssign,
          chemistry: temp.chemistry,
          chemistryRank: temp.chemistryRank,
          chemistryAssign: temp.chemistryAssign,
          chemistryRankAssign: temp.chemistryRankAssign,
          biology: temp.biology,
          biologyRank: temp.biologyRank,
          biologyAssign: temp.biologyAssign,
          biologyRankAssign: temp.biologyRankAssign,
          politics: temp.politics,
          politicsRank: temp.politicsRank,
          politicsAssign: temp.politicsAssign,
          politicsRankAssign: temp.politicsRankAssign,
          history: temp.history,
          historyRank: temp.historyRank,
          historyAssign: temp.historyAssign,
          historyRankAssign: temp.historyRankAssign,
          geography: temp.geography,
          geographyRank: temp.geographyRank,
          geographyAssign: temp.geographyAssign,
          geographyRankAssign: temp.geographyRankAssign,
          totalScore: temp.totalScore,
          totalRank: temp.totalRank,
          totalScoreAssign: temp.totalScoreAssign,
          totalRankAssign: temp.totalRankAssign
        }
        await this.scoreRepository.update(existingScore.id, updateData)
      } else {
        // 创建新记录
        const newScore = new Score()
        newScore.studentId = temp.studentId!
        newScore.examId = temp.examId!
        newScore.chinese = temp.chinese
        newScore.chineseRank = temp.chineseRank
        newScore.chineseAssign = temp.chineseAssign
        newScore.chineseRankAssign = temp.chineseRankAssign
        newScore.math = temp.math
        newScore.mathRank = temp.mathRank
        newScore.mathAssign = temp.mathAssign
        newScore.mathRankAssign = temp.mathRankAssign
        newScore.english = temp.english
        newScore.englishRank = temp.englishRank
        newScore.englishAssign = temp.englishAssign
        newScore.englishRankAssign = temp.englishRankAssign
        newScore.physics = temp.physics
        newScore.physicsRank = temp.physicsRank
        newScore.physicsAssign = temp.physicsAssign
        newScore.physicsRankAssign = temp.physicsRankAssign
        newScore.chemistry = temp.chemistry
        newScore.chemistryRank = temp.chemistryRank
        newScore.chemistryAssign = temp.chemistryAssign
        newScore.chemistryRankAssign = temp.chemistryRankAssign
        newScore.biology = temp.biology
        newScore.biologyRank = temp.biologyRank
        newScore.biologyAssign = temp.biologyAssign
        newScore.biologyRankAssign = temp.biologyRankAssign
        newScore.politics = temp.politics
        newScore.politicsRank = temp.politicsRank
        newScore.politicsAssign = temp.politicsAssign
        newScore.politicsRankAssign = temp.politicsRankAssign
        newScore.history = temp.history
        newScore.historyRank = temp.historyRank
        newScore.historyAssign = temp.historyAssign
        newScore.historyRankAssign = temp.historyRankAssign
        newScore.geography = temp.geography
        newScore.geographyRank = temp.geographyRank
        newScore.geographyAssign = temp.geographyAssign
        newScore.geographyRankAssign = temp.geographyRankAssign
        newScore.totalScore = temp.totalScore
        newScore.totalRank = temp.totalRank
        newScore.totalScoreAssign = temp.totalScoreAssign
        newScore.totalRankAssign = temp.totalRankAssign
        scoresToInsert.push(newScore)
      }

      // 更新临时表状态
      await this.tempRepository.update(temp.id, { status: 1 })
    }

    // 批量插入新成绩
    if (scoresToInsert.length > 0) {
      await this.scoreRepository.save(scoresToInsert)
    }

    return {
      success: true,
      message: `导入成功，更新 ${tempRecords.length - scoresToInsert.length} 条，新增 ${scoresToInsert.length} 条`,
      errors: errors.length > 0 ? errors : undefined
    }
  }

  /**
   * 放弃导入
   */
  @Post('cancel')
  async cancelImport(@Body() dto: ConfirmImportDto) {
    const result = await this.tempRepository.delete({
      importBatch: dto.importBatch
    })

    return {
      success: true,
      message: `已删除 ${result.affected} 条临时数据`
    }
  }

  /**
   * 手动匹配学生
   */
  @Post('manual-match')
  async manualMatch(
    @Body() dto: { tempId: number; studentId: number; importBatch: string }
  ) {
    await this.tempRepository.update(dto.tempId, {
      studentId: dto.studentId,
      matchedMethod: '手动匹配',
      status: 0
    })

    return { success: true, message: '匹配成功' }
  }

  /**
   * 匹配学生（调用Python微服务）
   */
  @Post('match')
  async matchStudents(@Body() body: any, @Req() req: Request) {
    console.log('[matchStudents] 收到的body:', JSON.stringify(body))
    console.log('[matchStudents] req.body:', JSON.stringify((req as any).body))

    // 从body中提取数据，处理各种可能的格式
    // 可能是 { existing_students: [...] } 或 { existing_students: { data: [...] } }
    let existingStudents = body.existing_students || body.existingStudents || []
    let importStudents = body.import_students || body.import_students || []

    // 处理被包装在 data 字段中的情况
    if (Array.isArray(existingStudents)) {
      // 已经是数组，直接使用
    } else if (existingStudents && typeof existingStudents === 'object' && 'data' in existingStudents) {
      existingStudents = existingStudents.data
    }

    if (Array.isArray(importStudents)) {
      // 已经是数组
    } else if (importStudents && typeof importStudents === 'object' && 'data' in importStudents) {
      importStudents = importStudents.data
    }

    // 确保是数组
    if (!Array.isArray(existingStudents)) existingStudents = []
    if (!Array.isArray(importStudents)) importStudents = []

    console.log('[matchStudents] existingStudents:', existingStudents.length)
    console.log('[matchStudents] importStudents:', importStudents.length)

    try {
      const requestPayload = {
        existing_students: existingStudents,
        import_students: importStudents
      }
      console.log('[matchStudents] 请求Python:', JSON.stringify(requestPayload).substring(0, 500))

      const response = await axios.post(`${this.PYTHON_API}/python/score/match`, requestPayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      return response.data
    } catch (error: any) {
      console.error('匹配学生失败:', error.message, error.response?.status)
      console.error('匹配学生失败 - response.data:', error.response?.data)
      const detail = error.response?.data?.detail
      const msg = typeof detail === 'string' ? detail : (detail?.message || JSON.stringify(detail) || error.message)
      return {
        success: false,
        message: '匹配学生失败: ' + msg
      }
    }
  }

  /**
   * 保存到临时表
   * 将匹配结果保存到临时表
   */
  @Post('save-to-temp')
  async saveToTemp(@Body() body: { examId: number; matched: any[]; unmatched?: any[] }) {
    const { examId, matched, unmatched } = body

    console.log('[saveToTemp] examId:', examId)
    console.log('[saveToTemp] matched:', matched?.length, matched?.slice(0, 2))
    console.log('[saveToTemp] unmatched:', unmatched?.length)

    if (!examId) {
      return { success: false, message: '缺少考试ID' }
    }

    const importBatch = `IMPORT_${Date.now()}`
    const allStudents = [...(matched || []), ...(unmatched || [])]

    console.log('[saveToTemp] allStudents count:', allStudents.length)

    if (allStudents.length === 0) {
      return { success: false, message: '没有可保存的数据' }
    }

    const queryRunner = this.tempRepository.manager.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      let savedCount = 0

      for (const s of allStudents) {
        // 从 scores 中提取各科成绩
        const scores = s.scores || {}

        const temp = new ScoreImportTemp()
        temp.examId = examId
        temp.importBatch = importBatch
        temp.studentId = s.matched_student_id || null
        temp.matchedMethod = s.match_method || '自动匹配'
        temp.status = s.matched_student_id ? 0 : -1  // -1表示未匹配
        temp.rawData = scores

        // 总分
        if (scores['总分']) {
          temp.totalScore = scores['总分'].raw
          temp.totalRank = scores['总分'].school_rank
          temp.totalScoreAssign = scores['总分'].assign
          temp.totalRankAssign = scores['总分'].assign_rank
        }

        // 各科目
        const subjectMap: Record<string, string> = {
          '语文': 'chinese', '数学': 'math', '英语': 'english',
          '物理': 'physics', '化学': 'chemistry', '生物': 'biology',
          '政治': 'politics', '历史': 'history', '地理': 'geography'
        }

        for (const [subj, field] of Object.entries(subjectMap)) {
          if (scores[subj]) {
            const score = scores[subj]
            // 逐个设置属性，避免TypeScript类型问题
            if (field === 'chinese') {
              temp.chinese = score.raw
              temp.chineseRank = score.school_rank
              temp.chineseAssign = score.assign
              temp.chineseRankAssign = score.assign_rank
            } else if (field === 'math') {
              temp.math = score.raw
              temp.mathRank = score.school_rank
              temp.mathAssign = score.assign
              temp.mathRankAssign = score.assign_rank
            } else if (field === 'english') {
              temp.english = score.raw
              temp.englishRank = score.school_rank
              temp.englishAssign = score.assign
              temp.englishRankAssign = score.assign_rank
            } else if (field === 'physics') {
              temp.physics = score.raw
              temp.physicsRank = score.school_rank
              temp.physicsAssign = score.assign
              temp.physicsRankAssign = score.assign_rank
            } else if (field === 'chemistry') {
              temp.chemistry = score.raw
              temp.chemistryRank = score.school_rank
              temp.chemistryAssign = score.assign
              temp.chemistryRankAssign = score.assign_rank
            } else if (field === 'biology') {
              temp.biology = score.raw
              temp.biologyRank = score.school_rank
              temp.biologyAssign = score.assign
              temp.biologyRankAssign = score.assign_rank
            } else if (field === 'politics') {
              temp.politics = score.raw
              temp.politicsRank = score.school_rank
              temp.politicsAssign = score.assign
              temp.politicsRankAssign = score.assign_rank
            } else if (field === 'history') {
              temp.history = score.raw
              temp.historyRank = score.school_rank
              temp.historyAssign = score.assign
              temp.historyRankAssign = score.assign_rank
            } else if (field === 'geography') {
              temp.geography = score.raw
              temp.geographyRank = score.school_rank
              temp.geographyAssign = score.assign
              temp.geographyRankAssign = score.assign_rank
            }
          }
        }

        await queryRunner.manager.save(temp)
        savedCount++
      }

      await queryRunner.commitTransaction()

      return {
        success: true,
        message: `成功保存 ${savedCount} 条到临时表`,
        importBatch,
        count: savedCount
      }
    } catch (error: any) {
      await queryRunner.rollbackTransaction()
      console.error('保存临时表失败:', error)
      return { success: false, message: '保存失败: ' + error.message }
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * 检查重复数据
   */
  @Post('check-duplicate')
  async checkDuplicate(@Body() body: { examId: number; studentIds: number[] }) {
    if (!body.examId || !body.studentIds || body.studentIds.length === 0) {
      return { exists: false, count: 0, students: [] }
    }

    // 查询已存在的成绩记录
    const existingScores = await this.scoreRepository.find({
      where: {
        examId: body.examId,
        studentId: (await import('typeorm')).In(body.studentIds)
      },
      relations: ['student']
    })

    if (existingScores.length === 0) {
      return { exists: false, count: 0, students: [] }
    }

    // 返回重复的学生信息
    const students = existingScores.map(score => ({
      studentId: score.studentId,
      studentName: score.student?.name,
      studentNo: score.student?.studentNo
    }))

    return {
      exists: true,
      count: existingScores.length,
      students
    }
  }

  /**
   * 保存到原始成绩表（导入到正式表）
   * 将临时表数据保存到 exam_score 表，并更新临时表状态为已导入
   */
  @Post('save-to-exam-score')
  async saveToExamScore(@Body() body: { examId: number; matched?: any[] }) {
    const { examId } = body

    if (!examId) {
      return { success: false, message: '缺少考试ID' }
    }

    // 查询该考试临时表中未确认的数据
    const tempData = await this.tempRepository.find({
      where: { examId, status: 0 },
      relations: ['student']
    })

    if (tempData.length === 0) {
      return { success: false, message: '没有未确认的临时数据可导入' }
    }

    const queryRunner = this.tempRepository.manager.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 先删除该考试的已有成绩（覆盖模式）
      await queryRunner.query(
        'DELETE FROM exam_score WHERE exam_id = $1',
        [examId]
      )
      console.log(`已删除考试ID=${examId}的原有成绩`)

      let savedCount = 0

      for (const temp of tempData) {
        // 跳过没有匹配到学生的记录
        if (!temp.studentId) {
          console.log(`跳过: 没有studentId`)
          continue
        }

        // 验证学生ID是否存在
        const studentExists = await queryRunner.query(
          'SELECT id FROM student WHERE id = $1',
          [temp.studentId]
        )
        if (studentExists.length === 0) {
          console.log(`跳过: 学生ID=${temp.studentId} 不存在`)
          continue
        }

        // 获取导入批次号
        const importBatch = temp.importBatch || `EXAM_${examId}_${Date.now()}`

        // 插入到 exam_score 表
        await queryRunner.query(
          `INSERT INTO exam_score (
            exam_id, student_id, import_batch,
            chinese, chinese_rank, chinese_assign, chinese_rank_assign,
            math, math_rank, math_assign, math_rank_assign,
            english, english_rank, english_assign, english_rank_assign,
            physics, physics_rank, physics_assign, physics_rank_assign,
            chemistry, chemistry_rank, chemistry_assign, chemistry_rank_assign,
            biology, biology_rank, biology_assign, biology_rank_assign,
            politics, politics_rank, politics_assign, politics_rank_assign,
            history, history_rank, history_assign, history_rank_assign,
            geography, geography_rank, geography_assign, geography_rank_assign,
            total_score, total_rank, total_score_assign, total_rank_assign,
            status, matched_method
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45)`,
          [
            examId,
            temp.studentId,
            importBatch,
            temp.chinese, temp.chineseRank, temp.chineseAssign, temp.chineseRankAssign,
            temp.math, temp.mathRank, temp.mathAssign, temp.mathRankAssign,
            temp.english, temp.englishRank, temp.englishAssign, temp.englishRankAssign,
            temp.physics, temp.physicsRank, temp.physicsAssign, temp.physicsRankAssign,
            temp.chemistry, temp.chemistryRank, temp.chemistryAssign, temp.chemistryRankAssign,
            temp.biology, temp.biologyRank, temp.biologyAssign, temp.biologyRankAssign,
            temp.politics, temp.politicsRank, temp.politicsAssign, temp.politicsRankAssign,
            temp.history, temp.historyRank, temp.historyAssign, temp.historyRankAssign,
            temp.geography, temp.geographyRank, temp.geographyAssign, temp.geographyRankAssign,
            temp.totalScore, temp.totalRank, temp.totalScoreAssign, temp.totalRankAssign,
            1, // status: 1 已确认
            temp.matchedMethod || '自动匹配'
          ]
        )
        savedCount++

        // 更新临时表状态为已导入 (status = 2)
        await queryRunner.query(
          'UPDATE score_import_temp SET status = 2 WHERE id = $1',
          [temp.id]
        )
      }

      // 更新考试的 has_scores 标记
      await queryRunner.query(
        `UPDATE exam SET has_scores = 1, score_import_time = NOW() WHERE id = $1`,
        [examId]
      )

      await queryRunner.commitTransaction()

      return {
        success: true,
        message: `成功导入 ${savedCount} 条成绩`,
        count: savedCount
      }
    } catch (error: any) {
      await queryRunner.rollbackTransaction()
      console.error('保存原始成绩失败:', error)
      return { success: false, message: '保存失败: ' + error.message }
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * 获取原始成绩列表（成绩管理页面）
   */
  @Get('exam-score-list')
  async getExamScoreList(
    @Query('examId') examId?: number,
    @Query('status') status?: number,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20
  ) {
    const queryBuilder = this.examScoreRepository.createQueryBuilder('es')
      .leftJoinAndSelect('es.student', 'student')
      .leftJoinAndSelect('student.class', 'class')

    if (examId) {
      queryBuilder.where('es.examId = :examId', { examId })
    }

    if (status !== undefined) {
      queryBuilder.andWhere('es.status = :status', { status })
    }

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('es.id', 'ASC')
      .getManyAndCount()

    // 转换数据
    const transformedList = list.map((item: any) => ({
      ...item,
      student: item.student ? {
        name: item.student.name,
        studentNo: item.student.studentNo,
        class: item.student.class ? {
          className: item.student.class.className
        } : null
      } : null
    }))

    return {
      list: transformedList,
      total,
      page,
      pageSize
    }
  }

  /**
   * 删除原始成绩记录
   */
  @Delete('exam-score/:id')
  async deleteExamScore(@Param('id', ParseIntPipe) id: number) {
    await this.examScoreRepository.delete(id)
    return { success: true, message: '删除成功' }
  }
}
