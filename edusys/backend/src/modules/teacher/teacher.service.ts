import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Teacher } from '../../entities/teacher.entity'

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>
  ) {}

  async findAll(page: number = 1, pageSize: number = 20, keyword?: string) {
    const query = this.teacherRepository.createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.subject', 'subject')

    if (keyword) {
      query.where('teacher.name LIKE :keyword OR teacher.teacherNo LIKE :keyword', {
        keyword: `%${keyword}%`
      })
    }

    query.orderBy('teacher.id', 'DESC')

    const total = await query.getCount()
    const data = await query.skip((page - 1) * pageSize).take(pageSize).getMany()

    return {
      total,
      data,
      page,
      pageSize
    }
  }

  async findOne(id: number) {
    return this.teacherRepository.findOne({
      where: { id },
      relations: ['subject']
    })
  }

  async create(data: Partial<Teacher>) {
    const teacher = this.teacherRepository.create(data)
    return this.teacherRepository.save(teacher)
  }

  async update(id: number, data: Partial<Teacher>) {
    await this.teacherRepository.update(id, data)
    return this.findOne(id)
  }

  async delete(id: number) {
    return this.teacherRepository.delete(id)
  }

  async getSubjects() {
    return this.teacherRepository.manager.query(`SELECT id, "subjectName" as name FROM subject WHERE status = 1 ORDER BY id`)
  }
}