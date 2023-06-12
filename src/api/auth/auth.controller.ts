import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto } from './dto';
import { ApiResponse } from 'src/common/responses';
import { RequestWithUser } from 'src/common/interfaces';
import { AccessTokenGuard, RefreshTokenGuard } from './guards';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);
    return new ApiResponse(data, 'Login successful.');
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getCurrentUser(@Req() req: RequestWithUser) {
    const data = await this.authService.getCurrentUser(req.user.sub);
    return new ApiResponse(data, '');
  }

  @UseGuards(AccessTokenGuard)
  @Post('change-password')
  async changePassword(@Req() req: RequestWithUser, @Body() changePasswordDto: ChangePasswordDto) {
    await this.authService.changePassword(req.user.sub, changePasswordDto);
    return new ApiResponse(null, 'Password changed successfully.');
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;

    const data = await this.authService.refreshTokens(userId, refreshToken);
    return new ApiResponse(data);
  }
}
