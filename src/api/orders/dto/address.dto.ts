import { IsNotEmpty } from 'class-validator';

export class AddressDto {
  @IsNotEmpty()
  street: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  state: string;

  @IsNotEmpty()
  postalCode: string;
}
