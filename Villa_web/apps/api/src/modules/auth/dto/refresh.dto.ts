import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RefreshDto {
  @ApiPropertyOptional({
    description:
      'Opsional untuk browser — refresh token diambil dari httpOnly cookie. Wajib hanya untuk klien non-browser.',
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  refresh_token?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'PasswordLama1' })
  @IsString()
  @MinLength(1, { message: 'password lama wajib diisi' })
  password_lama!: string;

  @ApiProperty({ example: 'PasswordBaru2', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'password baru minimal 8 karakter' })
  @MaxLength(72, { message: 'password baru maksimal 72 karakter' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'password baru harus mengandung huruf dan angka',
  })
  password_baru!: string;
}
