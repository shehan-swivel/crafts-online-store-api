import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
  async login(loginDto: LoginDto): Promise<{ requirePasswordChange: boolean; accessToken: string }> {
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

    const accessToken = await this.getToken(user.id, user.username, user.role);
    return { requirePasswordChange: user.requirePasswordChange, accessToken };
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
   * Generate a jwt token
   * @param {string} userId
   * @param {string} username
   * @param {Role} role
   * @returns {Promise<string>}
   */
  private async getToken(userId: string, username: string, role: Role): Promise<string> {
    const payload = { sub: userId, username, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRED_IN,
    });

    return accessToken;
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
