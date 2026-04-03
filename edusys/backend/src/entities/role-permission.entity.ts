import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { Role } from './role.entity'
import { Permission } from './permission.entity'

@Entity('sys_role_permission')
export class RolePermission {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'role_id', type: 'bigint' })
  roleId: number

  @Column({ name: 'permission_id', type: 'bigint' })
  permissionId: number

  @ManyToOne(() => Role, (role) => role.rolePermissions)
  @JoinColumn({ name: 'role_id' })
  role: Role

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission
}