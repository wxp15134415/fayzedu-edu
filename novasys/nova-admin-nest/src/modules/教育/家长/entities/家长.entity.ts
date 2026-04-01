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

@Entity('jy_jiiazhang')
@Index(['yonghuId'])
@Index(['shoujihao'])
@Index(['zhuangtai'])
export class Jiazhang {
  @PrimaryGeneratedColumn({ comment: '家长ID' })
  id: number

  @Column({
    type: 'integer',
    nullable: true,
    comment: '关联系统用户ID',
  })
  yonghu_id: number | null

  @Column({
    length: 50,
    comment: '家长姓名',
  })
  xingming: string

  @Column({
    length: 11,
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
    comment: '与学生关系（父母/祖父母/其他）',
  })
  guanxi: string

  @Column({
    length: 100,
    nullable: true,
    comment: '工作单位',
  })
  gongzuodanwei: string

  @Column({
    length: 50,
    nullable: true,
    comment: '职务',
  })
  zhiwu: string

  @Column({
    length: 500,
    default: '',
    comment: '备注',
  })
  beizhu: string

  @Column({
    type: 'smallint',
    default: 0,
    comment: '状态（0正常 1无效）',
  })
  zhuangtai: number

  @CreateDateColumn({ comment: '创建时间' })
  @DateFormat()
  chuangjian_shijian: Date

  @UpdateDateColumn({ comment: '更新时间' })
  @DateFormat()
  gengxin_shijian: Date

  // 关联系统用户
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'yonghu_id' })
  user: User | null
}
