import { IsEnum, ValidateIf } from 'class-validator';
import { Role } from 'src/constants/enums';

export class UpdateUserDto {
  @ValidateIf((_, value) => !!value)
  @IsEnum(Role)
  role?: Role;

  email?: string;

  refreshToken?: string;
}
