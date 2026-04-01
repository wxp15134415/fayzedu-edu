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
import { User } from '@/modules/system/user/entities/user.entity'

@Entity('jy_jiaoshi')
@Index(['gonghao'])
@Index(['yonghuId'])
@Index(['zhuangtai'])
export class Teacher {
  @PrimaryGeneratedColumn({ comment: '教师ID' })
  id: number

  @Column({
    type: 'integer',
    nullable: true,
    comment: '关联系统用户ID',
  })
  yonghuId: number | null

  @Column({
    length: 30,
    unique: true,
    nullable: true,
    comment: '工号',
  })
  gonghao: string

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
    length: 18,
    nullable: true,
    comment: '身份证号',
  })
  shenfenzheng: string

  @Column({
    length: 11,
    nullable: true,
    comment: '手机号',
  })
  shoujihao: string

  @Column({
    length: 100,
    nullable: true,
    comment: '邮箱',
  })
  youxiang: string

  @Column({
    length: 20,
    nullable: true,
    comment: '教师类型（正式/临聘/实习）',
  })
  jiaoshileixing: string

  @Column({
    type: 'date',
    nullable: true,
    comment: '入职日期',
  })
  ruzhi_riqi: Date

  @Column({
    length: 50,
    nullable: true,
    comment: '所教专业',
  })
  zhuanye: string

  @Column({
    length: 50,
    nullable: true,
    comment: '职称',
  })
  zhicheng: string

  @Column({
    type: 'text',
    nullable: true,
    comment: '个人简历',
  })
  jianli: string

  @Column({
    length: 500,
    default: '',
    comment: '备注',
  })
  beizhu: string

  @Column({
    type: 'smallint',
    default: 0,
    comment: '状态（0在职 1离职 2退休）',
  })
  zhuangtai: number

  @CreateDateColumn({
    comment: '创建时间',
  })
  @DateFormat()
  chuangjian_shijian: Date

  @UpdateDateColumn({
    comment: '更新时间',
  })
  @DateFormat()
  gengxin_shijian: Date

  // 关联系统用户
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'yonghu_id' })
  user: User | null
}
