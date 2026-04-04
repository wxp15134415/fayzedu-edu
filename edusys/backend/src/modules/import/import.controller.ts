import { Controller, Post, Get, Body, Query, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ImportService } from './import.service'

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  /**
   * 解析 Excel 文件
   */
  @Post('parse')
  @UseInterceptors(FileInterceptor('file'))
  async parse(
    @UploadedFile() file: Express.Multer.File,
    @Body('module') module: string
  ) {
    if (!file) {
      return { success: false, message: '请上传文件' }
    }

    const result = await this.importService.parseExcel(file.buffer, module || 'teacher')
    return { success: true, ...result }
  }

  /**
   * 预览导入数据
   */
  @Get('preview')
  async preview(
    @Query('batch') batch: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20
  ) {
    if (!batch) {
      return { success: false, message: '缺少批次号' }
    }

    const result = await this.importService.preview(batch, Number(page), Number(pageSize))
    return { success: true, data: result }
  }

  /**
   * 确认导入
   */
  @Post('confirm')
  async confirm(
    @Body('batch') batch: string,
    @Body('userId') userId: number = 1
  ) {
    if (!batch) {
      return { success: false, message: '缺少批次号' }
    }

    const result = await this.importService.confirm(batch, userId)
    return { ...result }
  }

  /**
   * 取消导入
   */
  @Post('cancel')
  async cancel(@Body('batch') batch: string) {
    if (!batch) {
      return { success: false, message: '缺少批次号' }
    }

    await this.importService.cancel(batch)
    return { success: true }
  }

  /**
   * 获取导入统计
   */
  @Get('stats')
  async stats(@Query('batch') batch: string) {
    if (!batch) {
      return { success: false, message: '缺少批次号' }
    }

    const result = await this.importService.getStats(batch)
    return { success: true, data: result }
  }
}