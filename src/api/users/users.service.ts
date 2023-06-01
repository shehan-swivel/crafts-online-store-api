import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from 'src/constants/enums';
import { RegisterDto } from '../auth/dto';
import { User } from './schemas/user.schema';

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
}
