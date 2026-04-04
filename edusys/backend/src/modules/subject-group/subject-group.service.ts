import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SubjectGroup, SubjectGroupSubject, StudentGroup, StudentSubject } from '@/entities'
import { CreateSubjectGroupDto, UpdateSubjectGroupDto, AssignStudentGroupDto, AssignStudentSubjectsDto } from './dto/subject-group.dto'

@Injectable()
export class SubjectGroupService {
  constructor(
    @InjectRepository(SubjectGroup)
    private subjectGroupRepository: Repository<SubjectGroup>,
    @InjectRepository(SubjectGroupSubject)
    private groupSubjectRepository: Repository<SubjectGroupSubject>,
    @InjectRepository(StudentGroup)
    private studentGroupRepository: Repository<StudentGroup>,
    @InjectRepository(StudentSubject)
    private studentSubjectRepository: Repository<StudentSubject>
  ) {}

  // ==================== 选科组合管理 ====================

  async createGroup(dto: CreateSubjectGroupDto) {
    const group = this.subjectGroupRepository.create({
      groupCode: dto.groupCode,
      groupName: dto.groupName,
      description: dto.description,
      status: 1
    })
    return this.subjectGroupRepository.save(group)
  }

  async findAllGroups() {
    return this.subjectGroupRepository.find({
      where: { status: 1 },
      order: { id: 'ASC' }
    })
  }

  async findGroupById(id: number) {
    const group = await this.subjectGroupRepository.findOne({
      where: { id },
      relations: ['subjects', 'subjects.subject']
    })
    if (!group) {
      throw new NotFoundException('选科组合不存在')
    }
    return group
  }

  async updateGroup(id: number, dto: UpdateSubjectGroupDto) {
    const group = await this.findGroupById(id)
    Object.assign(group, dto)
    return this.subjectGroupRepository.save(group)
  }

  async deleteGroup(id: number) {
    const group = await this.findGroupById(id)
    group.status = 0
    return this.subjectGroupRepository.save(group)
  }

  // ==================== 组合科目管理 ====================

  async setGroupSubjects(groupId: number, subjectIds: number[]) {
    // 先删除原有科目
    await this.groupSubjectRepository.delete({ groupId })

    // 添加新科目
    const groupSubjects = subjectIds.map((subjectId, index) => {
      return this.groupSubjectRepository.create({
        groupId,
        subjectId,
        sortOrder: index
      })
    })
    return this.groupSubjectRepository.save(groupSubjects)
  }

  async getGroupSubjects(groupId: number) {
    return this.groupSubjectRepository.find({
      where: { groupId },
      relations: ['subject'],
      order: { sortOrder: 'ASC' }
    })
  }

  // ==================== 学生选科组合 ====================

  async assignStudentGroup(dto: AssignStudentGroupDto) {
    // 先移除学生原有的组合
    await this.studentGroupRepository.delete({ studentId: dto.studentId })

    // 分配新组合
    const studentGroup = this.studentGroupRepository.create({
      studentId: dto.studentId,
      groupId: dto.groupId,
      status: 1
    })
    return this.studentGroupRepository.save(studentGroup)
  }

  async assignStudentGroups(batchDto: { studentIds: number[], groupId: number }) {
    // 批量分配学生到组合
    const studentGroups = batchDto.studentIds.map(studentId => {
      return this.studentGroupRepository.create({
        studentId,
        groupId: batchDto.groupId,
        status: 1
      })
    })

    // 先删除这些学生的原有组合
    await this.studentGroupRepository
      .createQueryBuilder()
      .delete()
      .where('studentId IN (:...studentIds)', { studentIds: batchDto.studentIds })
      .execute()

    return this.studentGroupRepository.save(studentGroups)
  }

  async getStudentGroup(studentId: number) {
    return this.studentGroupRepository.findOne({
      where: { studentId, status: 1 },
      relations: ['group']
    })
  }

  async getStudentsByGroup(groupId: number) {
    return this.studentGroupRepository.find({
      where: { groupId, status: 1 },
      relations: ['student', 'student.class']
    })
  }

  async getStudentsByGrade(gradeId: number) {
    // 获取某年级的所有学生及其选科组合
    return this.studentGroupRepository
      .createQueryBuilder('sg')
      .innerJoin('sg.student', 'student')
      .innerJoin('student.class', 'class')
      .where('class.gradeId = :gradeId', { gradeId })
      .andWhere('sg.status = :status', { status: 1 })
      .andWhere('student.status = :status', { status: 1 })
      .leftJoinAndSelect('sg.group', 'group')
      .leftJoinAndSelect('student.class', 'stClass')
      .getMany()
  }

  // ==================== 学生选科 ====================

  async setStudentSubjects(dto: AssignStudentSubjectsDto) {
    // 先删除学生原有的选科
    await this.studentSubjectRepository.delete({ studentId: dto.studentId })

    // 设置新的选科
    const studentSubjects = dto.subjectIds.map(subjectId => {
      return this.studentSubjectRepository.create({
        studentId: dto.studentId,
        subjectId,
        isSelected: true,
        status: 1
      })
    })
    return this.studentSubjectRepository.save(studentSubjects)
  }

  async getStudentSubjects(studentId: number) {
    return this.studentSubjectRepository.find({
      where: { studentId, status: 1 },
      relations: ['subject']
    })
  }

  // ==================== 统计 ====================

  async getGroupStudentCount(groupId: number) {
    const count = await this.studentGroupRepository.count({
      where: { groupId, status: 1 }
    })
    return { groupId, count }
  }

  async getAllGroupStats() {
    const groups = await this.subjectGroupRepository.find({
      where: { status: 1 }
    })

    const stats = await Promise.all(
      groups.map(async group => {
        const count = await this.studentGroupRepository.count({
          where: { groupId: group.id, status: 1 }
        })
        return {
          groupId: group.id,
          groupName: group.groupName,
          count
        }
      })
    )
    return stats
  }
}