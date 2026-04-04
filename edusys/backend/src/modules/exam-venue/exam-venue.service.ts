import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ExamVenue } from '@/entities'

@Injectable()
export class ExamVenueService {
  constructor(
    @InjectRepository(ExamVenue)
    private venueRepository: Repository<ExamVenue>
  ) {}

  async findAll(query: any) {
    const { page = 1, pageSize = 10, keyword } = query
    const where: any = {}

    if (keyword) {
      where.venueName = { $like: `%${keyword}%` }
    }

    const [list, total] = await this.venueRepository.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    return { list, total, page, pageSize }
  }

  async findOne(id: number) {
    const venue = await this.venueRepository.findOne({ where: { id } })
    if (!venue) {
      throw new NotFoundException('考点不存在')
    }
    return venue
  }

  async create(data: Partial<ExamVenue>) {
    const venue = this.venueRepository.create(data)
    return this.venueRepository.save(venue)
  }

  async update(id: number, data: Partial<ExamVenue>) {
    const venue = await this.findOne(id)
    Object.assign(venue, data)
    return this.venueRepository.save(venue)
  }

  async delete(id: number) {
    await this.findOne(id)
    await this.venueRepository.delete(id)
    return { message: '删除成功' }
  }
}
