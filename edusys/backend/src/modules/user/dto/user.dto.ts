import { IsString, IsNotEmpty, IsOptional, IsNumber, MinLength, IsEnum } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string

  @IsString()
  @IsNotEmpty()
  realName: string

  @IsNumber()
  @IsNotEmpty()
  roleId: number

  @IsString()
  @IsOptional()
  gradeIds?: string

  @IsString()
  @IsOptional()
  classIds?: string

  @IsNumber()
  @IsOptional()
  studentId?: number

  @IsNumber()
  @IsOptional()
  status?: number

  @IsString()
  @IsOptional()
  phone?: string

  @IsString()
  @IsOptional()
  email?: string
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  realName?: string

  @IsNumber()
  @IsOptional()
  roleId?: number

  @IsString()
  @IsOptional()
  gradeIds?: string

  @IsString()
  @IsOptional()
  classIds?: string

  @IsNumber()
  @IsOptional()
  studentId?: number

  @IsNumber()
  @IsOptional()
  status?: number

  @IsString()
  @IsOptional()
  phone?: string

  @IsString()
  @IsOptional()
  email?: string
}

export class UpdateUserStatusDto {
  @IsNumber()
  @IsNotEmpty()
  status: number
}