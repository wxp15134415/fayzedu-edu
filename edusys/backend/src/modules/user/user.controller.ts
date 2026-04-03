import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query
} from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto, UpdateUserDto, UpdateUserStatusDto } from './dto/user.dto'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('list')
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('sortField') sortField: string = '',
    @Query('sortOrder') sortOrder: string = '',
    @Query('keyword') keyword: string = ''
  ) {
    return this.userService.findAll(+page, +pageSize, sortField, sortOrder, keyword)
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.userService.findOne(+id)
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.userService.remove(+id)
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: number, @Body() dto: UpdateUserStatusDto) {
    return this.userService.updateStatus(+id, dto.status)
  }
}