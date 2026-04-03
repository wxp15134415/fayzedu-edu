import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Grade, Class, Student, Score } from '@/entities'
import { CreateGradeDto, UpdateGradeDto } from './dto/grade.dto'

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>
  ) {}

  async findAll(page: number = 1, pageSize: number = 10) {
    const [list, total] = await this.gradeRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { id: 'DESC' }
    })

    // 计算每个年级的学生数和班级数
    for (const grade of list) {
      const classes = await this.classRepository.find({ where: { gradeId: grade.id } })
      const classCount = classes.length
      let studentCount = 0
      for (const cls of classes) {
        const count = await this.studentRepository.count({ where: { classId: cls.id, status: 1 } })
        studentCount += count
      }
      grade.classCount = classCount
      grade.studentCount = studentCount
    }

    return { list, total, page, pageSize }
  }

  async findOne(id: number) {
    const grade = await this.gradeRepository.findOne({ where: { id } })
    if (!grade) {
      throw new NotFoundException(`年级不存在`)
    }
    return grade
  }

  async create(createGradeDto: CreateGradeDto) {
    const grade = this.gradeRepository.create(createGradeDto)
    const savedGrade = await this.gradeRepository.save(grade)

    // 如果设置了班级数，自动生成对应的班级
    if (savedGrade.classCount && savedGrade.classCount > 0) {
      await this.generateClasses(savedGrade, savedGrade.classCount)
    }

    return savedGrade
  }

  async update(id: number, updateGradeDto: UpdateGradeDto) {
    const grade = await this.findOne(id)
    const oldClassCount = grade.classCount || 0
    const newClassCount = updateGradeDto.classCount || 0

    Object.assign(grade, updateGradeDto)
    const savedGrade = await this.gradeRepository.save(grade)

    // 如果班级数发生变化，生成或删除班级
    if (newClassCount !== oldClassCount) {
      if (newClassCount > oldClassCount) {
        // 新增班级
        await this.generateClasses(savedGrade, newClassCount - oldClassCount)
      } else if (newClassCount < oldClassCount) {
        // 删除多余的班级
        const classes = await this.classRepository.find({
          where: { gradeId: id },
          order: { id: 'DESC' }
        })
        const deleteCount = oldClassCount - newClassCount
        for (let i = 0; i < deleteCount && i < classes.length; i++) {
          await this.classRepository.remove(classes[i])
        }
      }
    }

    return savedGrade
  }

  // 自动生成班级
  private async generateClasses(grade: Grade, count: number) {
    for (let i = 1; i <= count; i++) {
      await this.classRepository.save({
        classNo: i,
        className: `${grade.gradeName}${i}班`,
        gradeId: grade.id,
        studentCount: 0,
        status: 1
      })
    }
  }

  async remove(id: number) {
    const grade = await this.findOne(id)
    // 删除年级：先删除班级，再删除班级下的学生和成绩
    const classes = await this.classRepository.find({ where: { gradeId: id } })
    for (const cls of classes) {
      const students = await this.studentRepository.find({ where: { classId: cls.id } })
      for (const student of students) {
        await this.scoreRepository.delete({ studentId: student.id })
      }
      await this.studentRepository.delete({ classId: cls.id })
    }
    await this.classRepository.delete({ gradeId: id })
    await this.gradeRepository.remove(grade)
    return { message: '删除成功' }
  }
}
