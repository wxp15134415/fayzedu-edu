import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards
} from '@nestjs/common'
import { RoleService } from './role.service'
import { CreateRoleDto, UpdateRoleDto, UpdateRolePermissionsDto } from './dto/role.dto'
import { JwtAuthGuard } from '../auth/auth.guard'

@Controller('role')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('list')
  async findAll() {
    return this.roleService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.roleService.findOne(+id)
  }

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto)
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.roleService.remove(+id)
  }

  @Get(':id/permissions')
  async getPermissions(@Param('id') id: number) {
    return this.roleService.getPermissions(+id)
  }

  @Put(':id/permissions')
  async updatePermissions(
    @Param('id') id: number,
    @Body() dto: UpdateRolePermissionsDto
  ) {
    return this.roleService.updatePermissions(+id, dto.permissionIds)
  }
}