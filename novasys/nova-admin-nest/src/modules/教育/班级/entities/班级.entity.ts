import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { DateFormat } from '@/common/decorators'
import { Teacher } from '@/modules/教育/教师/entities/教师.entity'
import { Student } from '@/modules/教育/学生/entities/学生.entity'

@Entity('jy_banji')
@Index(['banjibianhao'])
@Index(['fudaoyuanId'])
@Index(['zhuangtai'])
export class Banji {
  @PrimaryGeneratedColumn({ comment: '班级ID' })
  id: number

  @Column({
    length: 30,
    unique: true,
    comment: '班级编号',
  })
  banjibianhao: string

  @Column({
    length: 50,
    comment: '班级名称',
  })
  banjimingcheng: string

  @Column({
    type: 'integer',
    nullable: true,
    comment: '父班级ID（用于年级分组）',
  })
  fu_banji_id: number | null

  @Column({
    length: 20,
    nullable: true,
    comment: '班级类型（教学班/行政班）',
  })
  banjileixing: string

  @Column({
    type: 'integer',
    default: 40,
    comment: '容量',
  })
  rongliang: number

  @Column({
    type: 'integer',
    nullable: true,
    comment: '年级',
  })
  dangji_nianji: number

  @Column({
    type: 'integer',
    default: 0,
    comment: '已注册人数',
  })
  suoxue_renshu: number

  @Column({
    length: 20,
    nullable: true,
    comment: '班级状态',
  })
  banji_zhuangtai: string

  @Column({
    type: 'integer',
    nullable: true,
    comment: '班主任ID',
  })
  fudaoyuan_id: number | null

  @Column({
    type: 'date',
    nullable: true,
    comment: '开班日期',
  })
  kaishi_riqi: Date

  @Column({
    type: 'date',
    nullable: true,
    comment: '结束日期',
  })
  jieshu_riqi: Date

  @Column({
    length: 500,
    default: '',
    comment: '备注',
  })
  beizhu: string

  @Column({
    type: 'smallint',
    default: 0,
    comment: '状态（0正常 1已毕业 2已解散）',
  })
  zhuangtai: number

  @CreateDateColumn({ comment: '创建时间' })
  @DateFormat()
  chuangjian_shijian: Date

  @UpdateDateColumn({ comment: '更新时间' })
  @DateFormat()
  gengxin_shijian: Date

  // 班主任
  @ManyToOne(() => Teacher, { nullable: true })
  @JoinColumn({ name: 'fudaoyuan_id' })
  fudaoyuan: Teacher | null

  // 班级学生
  @OneToMany(() => Student, student => student.banji)
  students: Student[]
}
