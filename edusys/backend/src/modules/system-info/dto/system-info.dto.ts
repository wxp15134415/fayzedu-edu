import { IsString, IsNumber, IsOptional } from 'class-validator'

export class UpdateSystemInfoDto {
  @IsString()
  @IsOptional()
  schoolName?: string

  @IsString()
  @IsOptional()
  currentYear?: string

  @IsNumber()
  @IsOptional()
  currentSemester?: number

  @IsString()
  @IsOptional()
  address?: string

  @IsString()
  @IsOptional()
  phone?: string

  @IsString()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  description?: string
}
