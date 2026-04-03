import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator'

export class CreateExamDto {
  @IsString()
  examName!: string

  @IsNumber()
  @IsOptional()
  gradeId?: number

  @IsString()
  @IsOptional()
  schoolYear?: string

  @IsString()
  @IsOptional()
  semester?: string

  @IsString()
  @IsOptional()
  examType?: string

  @IsDateString()
  @IsOptional()
  examDate?: string

  @IsNumber()
  @IsOptional()
  status?: number
}

export class UpdateExamDto {
  @IsString()
  @IsOptional()
  examName?: string

  @IsNumber()
  @IsOptional()
  gradeId?: number

  @IsString()
  @IsOptional()
  schoolYear?: string

  @IsString()
  @IsOptional()
  semester?: string

  @IsString()
  @IsOptional()
  examType?: string

  @IsDateString()
  @IsOptional()
  examDate?: string

  @IsNumber()
  @IsOptional()
  status?: number
}
