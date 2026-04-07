import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Student, Score, Class, Grade } from '@/entities'
import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator'
import { JwtAuthGuard } from '../auth/auth.guard'

class CreateStudentDto {
  @IsString()
  @IsOptional()
  studentNo?: string
  @IsString()
  @IsOptional()
  studentId?: string
  @IsString()
  @IsOptional()
  idCard?: string
  @IsString()
  name!: string
  @IsNumber()
  @IsOptional()
  classId?: number
  @IsString()
  @IsOptional()
  year1Class?: string
  @IsString()
  @IsOptional()
  year2Class?: string
  @IsString()
  @IsOptional()
  year3Class?: string
  @IsNumber()
  @IsOptional()
  seatNo?: number
  @IsString()
  @IsOptional()
  gender?: string
  @IsDateString()
  @IsOptional()
  birthDate?: string
  @IsString()
  @IsOptional()
  subjects?: string
  @IsString()
  @IsOptional()
  schoolType?: string
  @IsString()
  @IsOptional()
  source?: string
  @IsString()
  @IsOptional()
  subjectType?: string
  @IsString()
  @IsOptional()
  phone?: string
  @IsString()
  @IsOptional()
  address?: string
  @IsNumber()
  @IsOptional()
  status?: number
}

class UpdateStudentDto {
  @IsString()
  @IsOptional()
  studentNo?: string
  @IsString()
  @IsOptional()
  studentId?: string
  @IsString()
  @IsOptional()
  idCard?: string
  @IsString()
  @IsOptional()
  name?: string
  @IsNumber()
  @IsOptional()
  classId?: number
  @IsString()
  @IsOptional()
  year1Class?: string
  @IsString()
  @IsOptional()
  year2Class?: string
  @IsString()
  @IsOptional()
  year3Class?: string
  @IsNumber()
  @IsOptional()
  seatNo?: number
  @IsString()
  @IsOptional()
  gender?: string
  @IsDateString()
  @IsOptional()
  birthDate?: string
  @IsString()
  @IsOptional()
  subjects?: string
  @IsString()
  @IsOptional()
  schoolType?: string
  @IsString()
  @IsOptional()
  source?: string
  @IsString()
  @IsOptional()
  subjectType?: string
  @IsString()
  @IsOptional()
  phone?: string
  @IsString()
  @IsOptional()
  address?: string
  @IsNumber()
  @IsOptional()
  status?: number
  @IsString()
  @IsOptional()
  leaveStatus?: string
  @IsString()
  @IsOptional()
  qualityAnalysis?: string
}

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>
  ) {}

  @Get('list')
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('keyword') keyword: string = '',
    @Query('gradeId') gradeId: number | undefined = undefined,
    @Query('classId') classId: number | undefined = undefined,
    @Query('gender') gender: string = '',
    @Query('status') status: number | undefined = undefined,
    @Query('schoolType') schoolType: string = '',
    @Query('source') source: string = '',
    @Query('subjectType') subjectType: string = '',
    @Query('leaveStatus') leaveStatus: string = '',
    @Query('qualityAnalysis') qualityAnalysis: string = ''
  ) {
    const queryBuilder = this.studentRepository.createQueryBuilder('student')
      .leftJoinAndSelect('student.class', 'class')
      .leftJoinAndSelect('class.grade', 'grade')

    if (keyword) {
      queryBuilder.where(
        'student.studentNo LIKE :keyword OR student.name LIKE :keyword OR student.phone LIKE :keyword',
        { keyword: `%${keyword}%` }
      )
    }

    // 按年级筛选
    if (gradeId) {
      queryBuilder.andWhere('grade.id = :gradeId', { gradeId })
    }

    // 按班级筛选
    if (classId) {
      queryBuilder.andWhere('student.classId = :classId', { classId })
    }

    // 按性别筛选
    if (gender) {
      queryBuilder.andWhere('student.gender = :gender', { gender })
    }

    // 按状态筛选
    if (status !== undefined) {
      queryBuilder.andWhere('student.status = :status', { status })
    }

    // 按类型筛选
    if (schoolType) {
      queryBuilder.andWhere('student.schoolType = :schoolType', { schoolType })
    }

    // 按来源筛选
    if (source) {
      queryBuilder.andWhere('student.source = :source', { source })
    }

    // 按科类筛选
    if (subjectType) {
      queryBuilder.andWhere('student.subjectType = :subjectType', { subjectType })
    }

    // 按请假状态筛选
    if (leaveStatus) {
      queryBuilder.andWhere('student.leaveStatus = :leaveStatus', { leaveStatus })
    }

    // 按质量分析筛选
    if (qualityAnalysis) {
      queryBuilder.andWhere('student.qualityAnalysis = :qualityAnalysis', { qualityAnalysis })
    }

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('grade.entranceYear', 'ASC')
      .addOrderBy('class.classNo', 'ASC')
      .addOrderBy('student.seatNo', 'ASC')

    const [list, total] = await queryBuilder.getManyAndCount()
    return { list, total, page, pageSize }
  }

  // 获取学生类型筛选选项（从数据库动态获取）
  @Get('school-types')
  async getSchoolTypes() {
    const result = await this.studentRepository
      .createQueryBuilder('student')
      .select('DISTINCT student.schoolType', 'schoolType')
      .where('student.schoolType IS NOT NULL')
      .andWhere('student.schoolType != :empty', { empty: '' })
      .orderBy('student.schoolType', 'ASC')
      .getRawMany()

    return result.map((r: any) => r.schoolType)
  }

  // 获取学生来源筛选选项（从数据库动态获取）
  @Get('sources')
  async getSources() {
    const result = await this.studentRepository
      .createQueryBuilder('student')
      .select('DISTINCT student.source', 'source')
      .where('student.source IS NOT NULL')
      .andWhere('student.source != :empty', { empty: '' })
      .orderBy('student.source', 'ASC')
      .getRawMany()

    return result.map((r: any) => r.source)
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.studentRepository.findOne({
      where: { id },
      relations: ['class', 'class.grade']
    })
  }

  @Post()
  async create(@Body() createDto: CreateStudentDto) {
    const student = this.studentRepository.create(createDto)
    const savedStudent = await this.studentRepository.save(student)

    // 如果分配了班级，更新年级的学生数
    if (savedStudent.classId) {
      await this.updateGradeStudentCount(savedStudent.classId)
    }

    return savedStudent
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateDto: UpdateStudentDto) {
    const oldStudent = await this.studentRepository.findOne({ where: { id } })
    await this.studentRepository.update(id, updateDto)

    // 如果班级发生变化，更新新旧班级的年级学生数
    if (oldStudent && updateDto.classId && oldStudent.classId !== updateDto.classId) {
      if (oldStudent.classId) {
        await this.updateGradeStudentCount(oldStudent.classId)
      }
      if (updateDto.classId) {
        await this.updateGradeStudentCount(updateDto.classId)
      }
    }

    return this.findOne(id)
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      const student = await this.studentRepository.findOne({ where: { id }, relations: ['class'] })
      const classId = student?.classId

      // 先删除关联的成绩记录
      await this.scoreRepository.delete({ studentId: id })
      await this.studentRepository.delete(id)

      // 更新年级的学生数
      if (classId) {
        await this.updateGradeStudentCount(classId)
      }

      return { message: '删除成功' }
    } catch (error: any) {
      if (error.code === '23503') {
        throw new Error('该学生有关联数据，无法删除')
      }
      console.error('Delete student error:', error)
      throw error
    }
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: number, @Body('status') status: number) {
    await this.studentRepository.update(id, { status })
    return { message: '状态更新成功' }
  }

  // 更新年级的学生数
  private async updateGradeStudentCount(classId: number) {
    const cls = await this.classRepository.findOne({ where: { id: classId }, relations: ['grade'] })
    if (cls && cls.gradeId) {
      const studentCount = await this.studentRepository.count({
        where: { classId, status: 1 }
      })
      await this.gradeRepository.update(cls.gradeId, { studentCount })
    }
  }
}
