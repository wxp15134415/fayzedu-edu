import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator'

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  roleName: string

  @IsString()
  @IsNotEmpty()
  roleCode: string

  @IsString()
  @IsOptional()
  roleDesc?: string

  @IsNumber()
  @IsOptional()
  isSystem?: number
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  roleName?: string

  @IsString()
  @IsOptional()
  roleCode?: string

  @IsString()
  @IsOptional()
  roleDesc?: string
}

export class UpdateRolePermissionsDto {
  @IsNumber({}, { each: true })
  permissionIds: number[]
}