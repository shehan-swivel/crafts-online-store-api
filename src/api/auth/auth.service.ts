import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/constants/enums';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Create default admin user
   * @returns {Promise<User>}
   */
  async createDefaultAdmin(): Promise<User> {
    const admin = await this.usersService.checkIfAdminExists();

    // Exit from function if the default admin already exists
    if (admin) {
      return;
    }

    // Get admin username, password from environment variables
    const username = this.configService.get('ADMIN_USERNAME');
    const password = this.configService.get('ADMIN_PASSWORD');

    const passwordHash = await this.hashData(password);

    const defaultAdmin: RegisterDto = {
      username,
      password: passwordHash,
      role: Role.ADMIN,
      email: '',
      requirePasswordChange: true,
    };

    // Create default admin user
    return this.usersService.create(defaultAdmin);
  }

  /**
   * Login a user
   * @param {LoginDto} loginDto
   * @returns {Promise<string>}
   */
  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const user = await this.usersService.findByUsername(loginDto.username);

    // Throw an error if user is not found
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatched = await bcrypt.compare(loginDto.password, user.password);

    // Throw an error if the passwords do not match
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.username, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user, ...tokens };
  }

  /**
   * Get current authenticated user
   * @param {string} userId
   * @returns {Promise<UserDocument>}
   */
  async getCurrentUser(userId: string): Promise<UserDocument> {
    const user = await this.usersService.findById(userId);

    // Throw an error if user is not found
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Change password
   * @param {string} userId
   * @param {ChangePasswordDto} changePasswordDto
   * @returns {Promise<User>}
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<User> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    // Throw an error if new password and confirm password do not match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and Confirm password do not match');
    }

    const user = await this.getCurrentUser(userId);
    const isPasswordMatched = await bcrypt.compare(currentPassword, user.password);

    // Throw an error if the current password does not match
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Set the new password and save
    user.password = await this.hashData(newPassword);
    user.requirePasswordChange = false;
    return user.save();
  }

  /**
   * Refresh 'access token' and 'refresh token'
   * @param userId string
   * @param refreshToken string
   * @returns {Promise<{ accessToken: string; refreshToken: string }>}
   */
  async refreshTokens(userId: string, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findById(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const isRefreshTokensMatched = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isRefreshTokensMatched) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  /**
   * Update refresh token in the database
   * @param userId string
   * @param refreshToken string
   * @returns {Promise<void>}
   */
  private async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  /**
   * Generate a jwt token
   * @param {string} userId
   * @param {string} username
   * @param {Role} role
   * @returns {Promise<{ accessToken: string; refreshToken: string }>}
   */
  private async getTokens(
    userId: string,
    username: string,
    role: Role,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, username, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRED_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRED_IN'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Hash a given string
   * @param {string} data
   * @returns {Promise<string>}
   */
  private async hashData(data: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(data, salt);
    return hash;
  }
}
