import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param
} from '@nestjs/common'
import { PermissionService } from './permission.service'
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto'

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('list')
  async findAll() {
    return this.permissionService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.permissionService.findOne(+id)
  }

  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto)
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updatePermissionDto: UpdatePermissionDto
  ) {
    return this.permissionService.update(+id, updatePermissionDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.permissionService.remove(+id)
  }
}