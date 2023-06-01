import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto } from './dto';
import { ApiResponse } from 'src/common/responses';
import { RequestWithUser } from 'src/common/interfaces';
import { JwtGuard } from './guards';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    const accessToken = await this.authService.login(loginDto);
    return new ApiResponse({ accessToken }, 'Login successful.');
  }

  @UseGuards(JwtGuard)
  @Get('me')
  async getCurrentUser(@Req() req: RequestWithUser) {
    const data = await this.authService.getCurrentUser(req.user.sub);
    return new ApiResponse(data, '');
  }

  @UseGuards(JwtGuard)
  @Post('change-password')
  async changePassword(@Req() req: RequestWithUser, @Body() changePasswordDto: ChangePasswordDto) {
    await this.authService.changePassword(req.user.sub, changePasswordDto);
    return new ApiResponse(null, 'Password changed successfully.');
  }
}
