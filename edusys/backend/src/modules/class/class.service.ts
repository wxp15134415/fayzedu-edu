import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Class, Student, Score, Grade } from '@/entities'
import { CreateClassDto, UpdateClassDto } from './dto/class.dto'

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>
  ) {}

  async findAll(page: number = 1, pageSize: number = 10) {
    const list = await this.classRepository
      .createQueryBuilder('cls')
      .leftJoinAndSelect('cls.grade', 'grade')
      .where('cls.status = :status', { status: 1 })
      .orderBy('grade.entranceYear', 'ASC')
      .addOrderBy('grade.gradeName', 'ASC')
      .addOrderBy('cls.classNo', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany()

    const total = await this.classRepository.count({ where: { status: 1 } })

    return { list, total, page, pageSize }
  }

  async findOne(id: number) {
    const cls = await this.classRepository.findOne({
      where: { id },
      relations: ['grade']
    })
    if (!cls) {
      throw new NotFoundException(`班级不存在`)
    }
    return cls
  }

  async create(createClassDto: CreateClassDto) {
    // 获取年级信息来生成班级名称
    const grade = await this.classRepository.manager.findOne(Grade, {
      where: { id: createClassDto.gradeId }
    })
    const className = `${grade?.gradeName || ''}${createClassDto.classNo}班`

    const cls = this.classRepository.create({
      ...createClassDto,
      className
    })
    return this.classRepository.save(cls)
  }

  async update(id: number, updateClassDto: UpdateClassDto) {
    const cls = await this.findOne(id)

    // 如果更新了班级编号，同步更新班级名称
    if (updateClassDto.classNo && updateClassDto.classNo !== cls.classNo) {
      const grade = await this.classRepository.manager.findOne(Grade, {
        where: { id: cls.gradeId }
      })
      cls.className = `${grade?.gradeName || ''}${updateClassDto.classNo}班`
    }

    Object.assign(cls, updateClassDto)
    return this.classRepository.save(cls)
  }

  async remove(id: number) {
    const cls = await this.findOne(id)
    // 先删除班级下学生的成绩，再删除学生，最后删除班级
    const students = await this.studentRepository.find({ where: { classId: id } })
    for (const student of students) {
      await this.scoreRepository.delete({ studentId: student.id })
    }
    await this.studentRepository.delete({ classId: id })
    await this.classRepository.remove(cls)
    return { message: '删除成功' }
  }
}
