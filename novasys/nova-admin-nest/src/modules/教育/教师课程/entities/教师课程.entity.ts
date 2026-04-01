import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { DateFormat } from '@/common/decorators'
import { Teacher } from '@/modules/教育/教师/entities/教师.entity'
import { Course } from '@/modules/教育/课程/entities/课程.entity'
import { Banji } from '@/modules/教育/班级/entities/班级.entity'

@Entity('jy_jiaoshi_kecheng')
@Index(['jiaoshiId'])
@Index(['kechengId'])
@Index(['banjiId'])
export class TeacherCourse {
  @PrimaryGeneratedColumn({ comment: 'ID' })
  id: number

  @Column({
    type: 'integer',
    comment: '教师ID',
  })
  jiaoshi_id: number

  @Column({
    type: 'integer',
    comment: '课程ID',
  })
  kecheng_id: number

  @Column({
    type: 'integer',
    comment: '班级ID',
  })
  banji_id: number

  @Column({
    length: 20,
    comment: '学期',
  })
  xueqi: string

  @Column({
    type: 'integer',
    default: 0,
    comment: '代课人数',
  })
  daike_renshu: number

  @Column({
    length: 500,
    default: '',
    comment: '备注',
  })
  beizhu: string

  @CreateDateColumn({ comment: '创建时间' })
  @DateFormat()
  chuangjian_shijian: Date

  // 关联教师
  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'jiaoshi_id' })
  jiaoshi: Teacher

  // 关联课程
  @ManyToOne(() => Course)
  @JoinColumn({ name: 'kecheng_id' })
  kecheng: Course

  // 关联班级
  @ManyToOne(() => Banji)
  @JoinColumn({ name: 'banji_id' })
  banji: Banji
}
