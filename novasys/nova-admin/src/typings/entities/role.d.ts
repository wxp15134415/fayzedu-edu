/// <reference path="../global.d.ts"/>

/* 角色数据库表字段 */
namespace Entity {
  type RoleType = 'super' | 'admin' | 'user'

  interface Role {
    /** 角色ID */
    id?: number
    /** 角色名称 */
    roleName?: string
    /** 角色权限字符串 */
    roleKey?: string
    /** 角色状态（0正常 1停用） */
    status?: number
    /** 数据范围 */
    dataScope?: number
    /** 创建时间 */
    createTime?: Date
    /** 更新时间 */
    updateTime?: Date
    /** 备注 */
    remark?: string
    /** 角色类型 */
    role?: RoleType
  }
}
