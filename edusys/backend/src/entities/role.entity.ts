import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm'
import { User } from './user.entity'
import { RolePermission } from './role-permission.entity'

@Entity('sys_role')
export class Role {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'role_name', type: 'varchar', length: 50 })
  roleName: string

  @Column({ name: 'role_code', type: 'varchar', length: 50, unique: true })
  roleCode: string

  @Column({ name: 'role_desc', type: 'varchar', length: 255, nullable: true })
  roleDesc: string

  @Column({ name: 'is_system', type: 'smallint', default: 0 })
  isSystem: number

  @Column({ name: 'is_super_admin', type: 'smallint', default: 0 })
  isSuperAdmin: number

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions: RolePermission[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}