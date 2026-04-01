import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { DateFormat } from '@/common/decorators'
import { Teacher } from '@/modules/教育/教师/entities/教师.entity'

@Entity('jy_kecheng')
export class Course {
  @PrimaryGeneratedColumn({ comment: '课程ID' })
  id: number

  @Column({ length: 30, unique: true, comment: '课程编号' })
  kechengbianhao: string

  @Column({ length: 100, comment: '课程名称' })
  kechengming: string

  @Column({ length: 20, nullable: true, comment: '课程类型（必修/选修/实践）' })
  kechengleixing: string

  @Column({ type: 'integer', default: 0, comment: '学分' })
  xuefen: number

  @Column({ type: 'integer', default: 0, comment: '学时' })
  xueshi: number

  @Column({ type: 'text', nullable: true, comment: '课程描述' })
  kechengmiaoshu: string

  @Column({ type: 'integer', nullable: true, comment: '负责人ID' })
  fuzeren_id: number | null

  @Column({ length: 20, nullable: true, comment: '开课学期' })
  kaike_xueqi: string

  @Column({ length: 100, nullable: true, comment: '开课单位' })
  kaikedanwei: string

  @Column({ length: 50, nullable: true, comment: '上课时间' })
  kaikeshijian: string

  @Column({ length: 100, nullable: true, comment: '上课地点' })
  kaikedidian: string

  @Column({ length: 500, default: '', comment: '备注' })
  beizhu: string

  @Column({ type: 'smallint', default: 0, comment: '状态（0正常 1已停课）' })
  zhuangtai: number

  @CreateDateColumn({ comment: '创建时间' })
  @DateFormat()
  chuangjian_shijian: Date

  @UpdateDateColumn({ comment: '更新时间' })
  @DateFormat()
  gengxin_shijian: Date

  // 负责人
  @ManyToOne(() => Teacher, { nullable: true })
  @JoinColumn({ name: 'fuzeren_id' })
  fuzeren: Teacher | null
}
