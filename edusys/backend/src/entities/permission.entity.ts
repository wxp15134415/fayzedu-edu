import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm'
import { RolePermission } from './role-permission.entity'

@Entity('sys_permission')
export class Permission {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'permission_name', type: 'varchar', length: 50 })
  permissionName: string

  @Column({ name: 'permission_code', type: 'varchar', length: 50, unique: true })
  permissionCode: string

  @Column({ name: 'permission_desc', type: 'varchar', length: 255, nullable: true })
  permissionDesc: string

  @OneToMany(() => RolePermission, (rp) => rp.permission)
  rolePermissions: RolePermission[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}