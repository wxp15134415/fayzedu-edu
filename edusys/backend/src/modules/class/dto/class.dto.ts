import { IsString, IsNumber, IsOptional } from 'class-validator'

export class CreateClassDto {
  @IsNumber()
  classNo!: number

  @IsString()
  className!: string

  @IsNumber()
  gradeId!: number

  @IsNumber()
  @IsOptional()
  teacherId?: number

  @IsNumber()
  @IsOptional()
  status?: number
}

export class UpdateClassDto {
  @IsNumber()
  @IsOptional()
  classNo?: number

  @IsString()
  @IsOptional()
  className?: string

  @IsNumber()
  @IsOptional()
  gradeId?: number

  @IsNumber()
  @IsOptional()
  teacherId?: number

  @IsNumber()
  @IsOptional()
  status?: number
}
