import { IsString, IsNumber, IsOptional } from 'class-validator'

export class CreateGradeDto {
  @IsString()
  gradeName!: string

  @IsString()
  @IsOptional()
  schoolYear?: string

  @IsNumber()
  @IsOptional()
  entranceYear?: number

  @IsString()
  @IsOptional()
  period?: string

  @IsString()
  @IsOptional()
  semester?: string

  @IsNumber()
  @IsOptional()
  studentCount?: number

  @IsNumber()
  @IsOptional()
  classCount?: number

  @IsOptional()
  status?: number

  @IsString()
  @IsOptional()
  description?: string
}

export class UpdateGradeDto {
  @IsString()
  @IsOptional()
  gradeName?: string

  @IsString()
  @IsOptional()
  schoolYear?: string

  @IsNumber()
  @IsOptional()
  entranceYear?: number

  @IsString()
  @IsOptional()
  period?: string

  @IsString()
  @IsOptional()
  semester?: string

  @IsNumber()
  @IsOptional()
  studentCount?: number

  @IsNumber()
  @IsOptional()
  classCount?: number

  @IsOptional()
  status?: number

  @IsString()
  @IsOptional()
  description?: string
}