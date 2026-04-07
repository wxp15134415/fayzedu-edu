import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { SubjectGroupService } from './subject-group.service'
import { CreateSubjectGroupDto, UpdateSubjectGroupDto, SetGroupSubjectsDto, AssignStudentGroupDto, AssignStudentSubjectsDto, BatchAssignGroupDto } from './dto/subject-group.dto'
import { JwtAuthGuard } from '../auth/auth.guard'

@Controller('subject-group')
@UseGuards(JwtAuthGuard)
export class SubjectGroupController {
  constructor(private readonly subjectGroupService: SubjectGroupService) {}

  // ==================== 选科组合 ====================

  @Post()
  create(@Body() dto: CreateSubjectGroupDto) {
    return this.subjectGroupService.createGroup(dto)
  }

  @Get('list')
  findAll() {
    return this.subjectGroupService.findAllGroups()
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.subjectGroupService.findGroupById(id)
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateSubjectGroupDto) {
    return this.subjectGroupService.updateGroup(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.subjectGroupService.deleteGroup(id)
  }

  // ==================== 组合科目 ====================

  @Post(':id/subjects')
  setSubjects(@Param('id') id: number, @Body() dto: SetGroupSubjectsDto) {
    return this.subjectGroupService.setGroupSubjects(id, dto.subjectIds)
  }

  @Get(':id/subjects')
  getSubjects(@Param('id') id: number) {
    return this.subjectGroupService.getGroupSubjects(id)
  }

  // ==================== 学生组合 ====================

  @Post('student/group')
  assignStudentGroup(@Body() dto: AssignStudentGroupDto) {
    return this.subjectGroupService.assignStudentGroup(dto)
  }

  @Post('student/group/batch')
  batchAssignStudentGroup(@Body() dto: BatchAssignGroupDto) {
    return this.subjectGroupService.assignStudentGroups(dto)
  }

  @Get('student/:studentId/group')
  getStudentGroup(@Param('studentId') studentId: number) {
    return this.subjectGroupService.getStudentGroup(studentId)
  }

  @Get('group/:groupId/students')
  getStudentsByGroup(@Param('groupId') groupId: number) {
    return this.subjectGroupService.getStudentsByGroup(groupId)
  }

  @Get('grade/:gradeId/students')
  getStudentsByGrade(@Param('gradeId') gradeId: number) {
    return this.subjectGroupService.getStudentsByGrade(gradeId)
  }

  // ==================== 学生选科 ====================

  @Post('student/subjects')
  setStudentSubjects(@Body() dto: AssignStudentSubjectsDto) {
    return this.subjectGroupService.setStudentSubjects(dto)
  }

  @Get('student/:studentId/subjects')
  getStudentSubjects(@Param('studentId') studentId: number) {
    return this.subjectGroupService.getStudentSubjects(studentId)
  }

  // ==================== 统计 ====================

  @Get('stats')
  getAllStats() {
    return this.subjectGroupService.getAllGroupStats()
  }

  @Get(':id/stats')
  getGroupStats(@Param('id') id: number) {
    return this.subjectGroupService.getGroupStudentCount(id)
  }
}