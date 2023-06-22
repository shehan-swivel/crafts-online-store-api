import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { RequestWithUser } from 'src/common/interfaces';
import { ApiResponse } from 'src/common/responses';
import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto } from './dto';
import { AccessTokenGuard, RefreshTokenGuard } from './guards';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Login successful.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);
    return new ApiResponse(data, 'Login successful.');
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Logged in user fetched successfully.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async getCurrentUser(@Req() req: RequestWithUser) {
    const data = await this.authService.getCurrentUser(req.user.sub);
    return new ApiResponse(data, '');
  }

  @UseGuards(AccessTokenGuard)
  @Post('change-password')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Password changed successfully.' })
  @ApiBadRequestResponse({ description: 'New password and Confirm password do not match.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  async changePassword(@Req() req: RequestWithUser, @Body() changePasswordDto: ChangePasswordDto) {
    await this.authService.changePassword(req.user.sub, changePasswordDto);
    return new ApiResponse(null, 'Password changed successfully.');
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Tokens refreshed successfully.' })
  @ApiForbiddenResponse({ description: 'Access Denied.' })
  async refreshTokens(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;

    const data = await this.authService.refreshTokens(userId, refreshToken);
    return new ApiResponse(data);
  }
}
