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
import { Student } from '@/modules/教育/学生/entities/学生.entity'
import { Course } from '@/modules/教育/课程/entities/课程.entity'
import { Teacher } from '@/modules/教育/教师/entities/教师.entity'

@Entity('jy_chengji')
@Index(['xueshengId'])
@Index(['kechengId'])
@Index(['xueqi'])
export class Score {
  @PrimaryGeneratedColumn({ comment: '成绩ID' })
  id: number

  @Column({
    type: 'integer',
    comment: '学生ID',
  })
  xuesheng_id: number

  @Column({
    type: 'integer',
    comment: '课程ID',
  })
  kecheng_id: number

  @Column({
    type: 'integer',
    nullable: true,
    comment: '教师ID（阅卷）',
  })
  jiaoshi_id: number | null

  @Column({
    length: 20,
    comment: '学期',
  })
  xueqi: string

  @Column({
    length: 20,
    nullable: true,
    comment: '成绩类型（期中/期末/平时/补考）',
  })
  chengguo_leixing: string

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '分数',
  })
  fenshu: number

  @Column({
    length: 10,
    nullable: true,
    comment: '等级（优/良/中/差）',
  })
  dengji: string

  @Column({
    type: 'integer',
    nullable: true,
    comment: '班级排名',
  })
  paiming: number | null

  @Column({
    length: 500,
    default: '',
    comment: '备注',
  })
  beizhu: string

  @CreateDateColumn({ comment: '创建时间' })
  @DateFormat()
  chuangjian_shijian: Date

  @UpdateDateColumn({ comment: '更新时间' })
  @DateFormat()
  gengxin_shijian: Date

  // 关联学生
  @ManyToOne(() => Student)
  @JoinColumn({ name: 'xuesheng_id' })
  xuesheng: Student

  // 关联课程
  @ManyToOne(() => Course)
  @JoinColumn({ name: 'kecheng_id' })
  kecheng: Course

  // 关联教师
  @ManyToOne(() => Teacher, { nullable: true })
  @JoinColumn({ name: 'jiaoshi_id' })
  jiaoshi: Teacher | null
}
