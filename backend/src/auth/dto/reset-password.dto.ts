import { IsString, IsEmail, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsString({ message: 'Le code de réinitialisation est requis' })
  @Matches(/^\d{6}$/, { message: 'Le code doit contenir exactement 6 chiffres' })
  resetCode: string;

  @IsString({ message: 'Le nouveau mot de passe est requis' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  newPassword: string;
}




