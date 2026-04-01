/// <reference path="../global.d.ts"/>

/** 用户数据库表字段 */
namespace Entity {
  interface User {
    /** 用户id */
    id?: number
    /** 用户账号（登录用） */
    username?: string
    /** 用户密码 */
    password?: string
    /** 用户昵称 */
    nickName?: string
    /* 用户头像 */
    avatar?: string
    /* 用户性别 */
    gender?: 'male' | 'female' | 'unknown'
    /* 用户邮箱 */
    email?: string
    /* 用户电话 */
    phone?: string
    /** 部门ID */
    deptId?: number
    /** 部门对象（关联查询返回） */
    dept?: {
      id?: number
      deptName?: string
    }
    /** 用户角色类型 */
    role?: any[]
    /** 角色ID数组 */
    roleIds?: number[]
    /** 用户状态：0=正常，1=停用 */
    status?: 0 | 1
    /** 备注 */
    remark?: string
  }

}
