import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class AdminChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  newPassword: string;
}



























