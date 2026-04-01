import type { CanActivate, ExecutionContext } from '@nestjs/common'
import { Injectable } from '@nestjs/common'

/**
 * 权限守卫 - 已禁用所有权限验证
 * 所有接口可直接访问，无需登录和权限检查
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true
  }
}
