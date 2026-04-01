/// <reference path="../global.d.ts"/>

namespace Entity {
  interface Dept {
    id?: number
    parentId?: number
    ancestors?: string
    deptName?: string
    sort?: number
    leader?: string
    phone?: string
    email?: string
    status?: number
    createTime?: string
    updateTime?: string
    remark?: string
  }
}
