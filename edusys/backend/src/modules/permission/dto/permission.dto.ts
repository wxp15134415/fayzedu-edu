import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  permissionName: string

  @IsString()
  @IsNotEmpty()
  permissionCode: string

  @IsString()
  @IsOptional()
  permissionDesc?: string
}

export class UpdatePermissionDto {
  @IsString()
  @IsOptional()
  permissionName?: string

  @IsString()
  @IsOptional()
  permissionCode?: string

  @IsString()
  @IsOptional()
  permissionDesc?: string
}