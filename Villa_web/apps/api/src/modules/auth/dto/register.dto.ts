import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class RegisterDto {
  @ApiProperty({ example: 'budi.santoso' })
  @Transform(trim)
  @IsString()
  @Matches(/^[a-z0-9._-]{3,30}$/i, {
    message: 'username hanya boleh huruf, angka, titik, underscore, atau strip (3-30 karakter)',
  })
  username!: string;

  @ApiProperty({ example: 'Budi Santoso' })
  @Transform(trim)
  @IsString()
  @MinLength(3, { message: 'nama lengkap minimal 3 karakter' })
  @MaxLength(100)
  nama_lengkap!: string;

  @ApiProperty({ example: 'budi@email.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'format email tidak valid' })
  @MaxLength(150)
  email!: string;

  @ApiProperty({ example: 'Rahasia123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'password minimal 8 karakter' })
  @MaxLength(72, { message: 'password maksimal 72 karakter' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'password harus mengandung huruf dan angka',
  })
  password!: string;

  @ApiProperty({ example: '08123456789', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const digits = value.trim().replace(/[^\d+]/g, '');
    return digits.length > 0 ? digits : undefined;
  })
  @IsString()
  @Matches(/^\+?\d{8,15}$/, { message: 'nomor HP tidak valid' })
  no_hp?: string;
}
