import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'

@Entity('sys_menu')
export class Menu {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 50 })
  name!: string

  @Column({ length: 200, default: '' })
  path!: string

  @Column({ name: 'parent_id', default: 0 })
  parentId!: number

  @Column({ name: 'sort_order', default: 0 })
  sortOrder!: number

  @Column({ length: 50, default: '' })
  icon!: string

  @Column({ length: 100, default: '' })
  permission!: string

  @Column({ length: 20, default: 'menu' })
  type!: string

  @Column({ default: 1 })
  status!: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}