import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateSubjectGroupDto {
  @IsString()
  groupCode: string

  @IsString()
  groupName: string

  @IsString()
  @IsOptional()
  description?: string
}

export class UpdateSubjectGroupDto {
  @IsString()
  @IsOptional()
  groupCode?: string

  @IsString()
  @IsOptional()
  groupName?: string

  @IsString()
  @IsOptional()
  description?: string
}

export class SetGroupSubjectsDto {
  @IsNumber()
  groupId: number

  @IsArray()
  @IsNumber({}, { each: true })
  subjectIds: number[]
}

export class AssignStudentGroupDto {
  @IsNumber()
  studentId: number

  @IsNumber()
  groupId: number
}

export class AssignStudentSubjectsDto {
  @IsNumber()
  studentId: number

  @IsArray()
  @IsNumber({}, { each: true })
  subjectIds: number[]
}

export class BatchAssignGroupDto {
  @IsArray()
  @IsNumber({}, { each: true })
  studentIds: number[]

  @IsNumber()
  groupId: number
}