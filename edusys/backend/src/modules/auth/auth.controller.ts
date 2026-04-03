import { Controller, Post, Get, Body, UseGuards, Request, Res } from '@nestjs/common'
import { JwtAuthGuard } from './auth.guard'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/auth.dto'
import { Public } from './auth.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Public()
  @Post('logout')
  async logout() {
    return this.authService.logout()
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    return this.authService.getCurrentUser(req.user.id)
  }
}