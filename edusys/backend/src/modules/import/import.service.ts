import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ImportTemp } from '../../entities/import-temp.entity'
import * as XLSX from 'xlsx'
import * as crypto from 'crypto'

export interface ImportRowData {
  id?: number
  data: Record<string, any>
  status: 'pending' | 'valid' | 'invalid'
  errorMsg?: string
  isNew?: boolean
  isUpdate?: boolean
}

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(ImportTemp)
    private tempRepository: Repository<ImportTemp>
  ) {}

  /**
   * 生成批次号
   */
  generateBatch(): string {
    return `IMP_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
  }

  /**
   * 验证单行数据
   */
  private validateRow(row: Record<string, any>, module: string): { valid: boolean; message?: string } {
    switch (module) {
      case 'teacher':
        if (!row['工号'] && !row['teacherNo']) {
          return { valid: false, message: '工号不能为空' }
        }
        if (!row['姓名'] && !row['name']) {
          return { valid: false, message: '姓名不能为空' }
        }
        if (row['手机号'] || row['phone']) {
          const phone = row['手机号'] || row['phone']
          if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
            return { valid: false, message: '手机号格式不正确' }
          }
        }
        if (row['邮箱'] || row['email']) {
          const email = row['邮箱'] || row['email']
          if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return { valid: false, message: '邮箱格式不正确' }
          }
        }
        break
      default:
        break
    }
    return { valid: true }
  }

  /**
   * 解析 Excel 文件
   */
  async parseExcel(file: Buffer, module: string): Promise<{
    batch: string
    total: number
    headers: string[]
    data: ImportRowData[]
    valid: number
    invalid: number
    newCount: number
    updateCount: number
  }> {
    const batch = this.generateBatch()

    const workbook = XLSX.read(file, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[]

    if (!jsonData || jsonData.length === 0) {
      throw new Error('文件为空或格式错误')
    }

    const headers = Object.keys(jsonData[0])

    // 验证数据
    const data: ImportRowData[] = jsonData.map((row, index) => {
      const validation = this.validateRow(row, module)
      const rowData: ImportRowData = {
        data: row,
        status: validation.valid ? 'valid' : 'invalid',
        errorMsg: validation.message,
        isNew: true, // 默认新增
        isUpdate: false
      }
      return rowData
    })

    const valid = data.filter(d => d.status === 'valid').length
    const invalid = data.filter(d => d.status === 'invalid').length
    const newCount = data.filter(d => d.isNew).length
    const updateCount = data.filter(d => d.isUpdate).length

    // 保存到临时表
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const temp = this.tempRepository.create({
        batchNo: batch,
        module,
        data: row.data,
        rowIndex: i,
        status: row.status === 'valid' ? 1 : 2,
        errorMsg: row.errorMsg,
        isNew: row.isNew ? 1 : 0
      })
      await this.tempRepository.save(temp)
    }

    return { batch, total: data.length, headers, data, valid, invalid, newCount, updateCount }
  }

  /**
   * 预览导入数据
   */
  async preview(batch: string, page: number = 1, pageSize: number = 20) {
    const [list, total] = await this.tempRepository.findAndCount({
      where: { batchNo: batch },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    const valid = list.filter(l => l.status === 1).length
    const invalid = list.filter(l => l.status === 2).length
    const newCount = list.filter(l => l.isNew === 1).length
    const updateCount = list.filter(l => l.isNew === 0).length

    const data: ImportRowData[] = list.map(l => ({
      id: l.id,
      data: l.data,
      status: l.status === 1 ? 'valid' : 'invalid',
      errorMsg: l.errorMsg,
      isNew: l.isNew === 1,
      isUpdate: l.isNew === 0
    }))

    return {
      batch,
      total,
      valid,
      invalid,
      newCount,
      updateCount,
      data
    }
  }

  /**
   * 确认导入
   */
  async confirm(batch: string, userId: number) {
    const tempData = await this.tempRepository.find({
      where: { batchNo: batch, status: 1 }
    })

    const errors: Array<{ row: number; message: string }> = []
    let successCount = 0

    for (const temp of tempData) {
      try {
        await this.importRow(temp.data, temp.module || 'teacher')
        successCount++
      } catch (error: any) {
        errors.push({ row: temp.id, message: error.message })
      }
    }

    await this.tempRepository.update(
      { batchNo: batch },
      { status: 3 }
    )

    return {
      success: errors.length === 0,
      total: tempData.length,
      successCount,
      failedCount: errors.length,
      errors
    }
  }

  /**
   * 导入单行数据
   */
  private async importRow(data: Record<string, any>, module: string): Promise<void> {
    // 根据模块调用对应的服务
  }

  /**
   * 取消导入
   */
  async cancel(batch: string): Promise<void> {
    await this.tempRepository.delete({ batchNo: batch })
  }

  /**
   * 获取统计信息
   */
  async getStats(batch: string) {
    const list = await this.tempRepository.find({ where: { batchNo: batch } })

    return {
      total: list.length,
      valid: list.filter(l => l.status === 1).length,
      invalid: list.filter(l => l.status === 2).length,
      newCount: list.filter(l => l.isNew === 1).length,
      updateCount: list.filter(l => l.isNew === 0).length
    }
  }
}