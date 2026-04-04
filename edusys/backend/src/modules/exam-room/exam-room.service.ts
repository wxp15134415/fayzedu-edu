import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ExamRoom } from '@/entities'

@Injectable()
export class ExamRoomService {
  constructor(
    @InjectRepository(ExamRoom)
    private roomRepository: Repository<ExamRoom>
  ) {}

  async findAll(query: any) {
    const { page = 1, pageSize = 10, keyword, venueId } = query
    const where: any = {}

    if (venueId) {
      where.venueId = venueId
    }

    if (keyword) {
      where.roomName = { $like: `%${keyword}%` }
    }

    const [list, total] = await this.roomRepository.findAndCount({
      where,
      relations: ['venue'],
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    return { list, total, page, pageSize }
  }

  async findOne(id: number) {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['venue']
    })
    if (!room) {
      throw new NotFoundException('考场不存在')
    }
    return room
  }

  async create(data: Partial<ExamRoom>) {
    const room = this.roomRepository.create(data)
    return this.roomRepository.save(room)
  }

  async update(id: number, data: Partial<ExamRoom>) {
    const room = await this.findOne(id)
    Object.assign(room, data)
    return this.roomRepository.save(room)
  }

  async delete(id: number) {
    await this.findOne(id)
    await this.roomRepository.delete(id)
    return { message: '删除成功' }
  }
}
