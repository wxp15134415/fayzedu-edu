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
import { Banji } from '@/modules/教育/班级/entities/班级.entity'
import { Jiazhang } from '@/modules/教育/家长/entities/家长.entity'

@Entity('jy_xuesheng')
@Index(['xuehao'])
@Index(['banjiId'])
@Index(['jiazhangId'])
@Index(['zhuangtai'])
export class Student {
  @PrimaryGeneratedColumn({ comment: '学生ID' })
  id: number

  @Column({
    length: 30,
    unique: true,
    comment: '学号',
  })
  xuehao: string

  @Column({
    length: 50,
    comment: '姓名',
  })
  xingming: string

  @Column({
    length: 10,
    nullable: true,
    comment: '性别',
  })
  xingbie: string

  @Column({
    type: 'date',
    nullable: true,
    comment: '出生日期',
  })
  shengri: Date

  @Column({
    length: 18,
    nullable: true,
    comment: '身份证号',
  })
  shenfenzheng: string

  @Column({
    length: 20,
    nullable: true,
    comment: '民族',
  })
  minzu: string

  @Column({
    length: 100,
    nullable: true,
    comment: '籍贯/国籍',
  })
  jiguandanwei: string

  @Column({
    length: 200,
    nullable: true,
    comment: '家庭地址',
  })
  jiating_dizhi: string

  @Column({
    type: 'integer',
    nullable: true,
    comment: '关联家长ID',
  })
  jiazhangId: number | null

  @Column({
    type: 'integer',
    nullable: true,
    comment: '关联班级ID',
  })
  banjiId: number | null

  @Column({
    type: 'date',
    nullable: true,
    comment: '入学日期',
  })
  ruxue_riqi: Date

  @Column({
    type: 'date',
    nullable: true,
    comment: '毕业日期',
  })
  biye_riqi: Date

  @Column({
    length: 30,
    nullable: true,
    comment: '学籍账号',
  })
  xuejizhanghao: string

  @Column({
    length: 100,
    nullable: true,
    comment: '健康状况',
  })
  jiankangzhuangkuang: string

  @Column({
    length: 500,
    default: '',
    comment: '备注',
  })
  beizhu: string

  @Column({
    type: 'smallint',
    default: 0,
    comment: '状态（0在读 1休学 2毕业 3退学）',
  })
  zhuangtai: number

  @CreateDateColumn({ comment: '创建时间' })
  @DateFormat()
  chuangjian_shijian: Date

  @UpdateDateColumn({ comment: '更新时间' })
  @DateFormat()
  gengxin_shijian: Date

  // 关联班级
  @ManyToOne(() => Banji, { nullable: true })
  @JoinColumn({ name: 'banji_id' })
  banji: Banji | null

  // 关联家长
  @ManyToOne(() => Jiazhang, { nullable: true })
  @JoinColumn({ name: 'jiazhang_id' })
  jiazhang: Jiazhang | null
}
