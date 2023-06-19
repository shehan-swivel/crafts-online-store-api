import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from 'src/constants/enums';
import { RegisterDto } from '../auth/dto';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>, private configService: ConfigService) {}

  checkIfAdminExists() {
    const username = this.configService.get('ADMIN_USERNAME');
    return this.userModel.findOne({ username, role: Role.ADMIN });
  }

  create(registerDto: RegisterDto) {
    return this.userModel.create(registerDto);
  }

  findAll() {
    return this.userModel.find().exec();
  }

  findByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  findById(id: string) {
    return this.userModel.findById(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { role, email, refreshToken } = updateUserDto;

    user.role = role !== undefined ? role : user.role;
    user.email = email !== undefined ? email : user.email;
    user.refreshToken = refreshToken !== undefined ? refreshToken : user.refreshToken;

    return user.save();
  }
}
