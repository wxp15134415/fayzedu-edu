import { IsOptional, IsNumber, IsString, IsArray } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateUserDto {
  @ApiProperty({ required: false, description: '部门ID' })
  @IsOptional()
  @IsNumber()
  deptId?: number

  @ApiProperty({ required: false, description: '用户昵称' })
  @IsOptional()
  @IsString()
  nickName?: string

  @ApiProperty({ required: false, description: '用户邮箱' })
  @IsOptional()
  @IsString()
  email?: string

  @ApiProperty({ required: false, description: '手机号码' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({ required: false, description: '用户性别' })
  @IsOptional()
  @IsString()
  gender?: string

  @ApiProperty({ required: false, description: '头像地址' })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiProperty({ required: false, description: '用户状态' })
  @IsOptional()
  @IsNumber()
  status?: number

  @ApiProperty({ required: false, description: '备注信息' })
  @IsOptional()
  @IsString()
  remark?: string

  @ApiProperty({ required: false, description: '角色ID数组' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  roleIds?: number[]
}
