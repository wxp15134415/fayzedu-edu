import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile, Res } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { Student, ScoreImportTemp, Exam, Score, Class, Grade } from '@/entities'
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
  private readonly PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:8000/api/v1'

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

      const response = await axios.post(`${this.PYTHON_API}/parse`, formData, {
        headers: {
          ...formData.getHeaders()
        }
      })

      return response.data
    } catch (error: any) {
      console.error('解析文件失败:', error.message)
      return {
        success: false,
        message: '解析文件失败: ' + (error.response?.data?.detail || error.message)
      }
    }
  }

  /**
   * 预览导入数据（从临时表）
   */
  @Get('preview')
  async previewImport(
    @Query('importBatch') importBatch: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('status') status?: number
  ) {
    const queryBuilder = this.tempRepository.createQueryBuilder('temp')
      .leftJoinAndSelect('temp.student', 'student')
      .leftJoinAndSelect('student.class', 'class')
      .where('temp.importBatch = :importBatch', { importBatch })

    if (status !== undefined) {
      queryBuilder.andWhere('temp.status = :status', { status })
    }

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('temp.id', 'ASC')
      .getManyAndCount()

    // 统计
    const stats = await this.tempRepository
      .createQueryBuilder('temp')
      .select('temp.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('temp.importBatch = :importBatch', { importBatch })
      .groupBy('temp.status')
      .getRawMany()

    return {
      list,
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
  async matchStudents(@Body() body: { existingStudents: any[]; importStudents: any[] }) {
    try {
      const response = await axios.post(`${this.PYTHON_API}/match`, {
        existing_students: body.existingStudents,
        import_students: body.importStudents
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      return response.data
    } catch (error: any) {
      console.error('匹配学生失败:', error.message)
      return {
        success: false,
        message: '匹配学生失败: ' + (error.response?.data?.detail || error.message)
      }
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
}
