import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Menu } from '@/entities'
import { IsNumber, IsOptional, IsString } from 'class-validator'
import { MenuService } from './menu.service'
import { JwtAuthGuard } from '../auth/auth.guard'

class CreateMenuDto {
  @IsString()
  name!: string
  @IsString()
  @IsOptional()
  path?: string
  @IsNumber()
  @IsOptional()
  parentId?: number
  @IsNumber()
  @IsOptional()
  sortOrder?: number
  @IsString()
  @IsOptional()
  icon?: string
  @IsString()
  @IsOptional()
  permission?: string
  @IsString()
  @IsOptional()
  type?: string
  @IsNumber()
  @IsOptional()
  status?: number
}

@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(
    private menuService: MenuService
  ) {}

  @Get('tree')
  async findTree() {
    return this.menuService.findTree()
  }

  @Get('list')
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 100,
    @Query('keyword') keyword: string = ''
  ) {
    return this.menuService.findAll({ page, pageSize, keyword })
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.menuService.findOne(id)
  }

  @Post()
  async create(@Body() createDto: CreateMenuDto) {
    return this.menuService.create(createDto)
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateDto: Partial<CreateMenuDto>) {
    return this.menuService.update(id, updateDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.menuService.remove(id)
  }
}