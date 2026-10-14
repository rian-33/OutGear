import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreatePenghuniDto {
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

  @ApiProperty({
    example: 'Rahasia123',
    minLength: 8,
    description: 'Password awal yang bisa diganti penghuni',
  })
  @IsString()
  @MinLength(8, { message: 'password minimal 8 karakter' })
  @MaxLength(72, { message: 'password maksimal 72 karakter' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'password harus mengandung huruf dan angka',
  })
  password!: string;

  @ApiPropertyOptional({ example: '08123456789' })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const digits = value.trim().replace(/[^\d+]/g, '');
    return digits.length > 0 ? digits : undefined;
  })
  @IsString()
  @Matches(/^\+?\d{8,15}$/, { message: 'nomor HP tidak valid' })
  no_hp?: string;

  @ApiPropertyOptional({ example: '2026-01-15', description: 'Tanggal masuk kos (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'tgl_masuk harus berformat YYYY-MM-DD' })
  tgl_masuk?: string;

  @ApiPropertyOptional({
    example: 'cm123abc456',
    description:
      'Kamar yang langsung ditempati (FR-11: buat penghuni + assign kamar dalam satu transaksi)',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  id_kamar?: string;
}

export class AssignKamarDto {
  @ApiProperty({ example: 'cm123abc456', description: 'id_kamar tujuan' })
  @IsString()
  @MinLength(1)
  id_kamar!: string;

  @ApiPropertyOptional({ example: '2026-02-01', description: 'Tanggal mulai menempati kamar baru' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'tgl_masuk harus berformat YYYY-MM-DD' })
  tgl_masuk?: string;
}

export class UpdatePenghuniDto {
  @ApiPropertyOptional({ example: 'Budi Santoso' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(3, { message: 'nama lengkap minimal 3 karakter' })
  @MaxLength(100)
  nama_lengkap?: string;

  @ApiPropertyOptional({ example: 'budi@email.com' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'format email tidak valid' })
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({ example: '08123456789' })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const digits = value.trim().replace(/[^\d+]/g, '');
    return digits.length > 0 ? digits : undefined;
  })
  @IsString()
  @Matches(/^\+?\d{8,15}$/, { message: 'nomor HP tidak valid' })
  no_hp?: string;

  @ApiPropertyOptional({ example: '2026-03-01', description: 'Perpanjang jatuh tempo sewa' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'jatuh_tempo harus berformat YYYY-MM-DD' })
  jatuh_tempo?: string;

  @ApiPropertyOptional({ example: 'RahasiaBaru1' })
  @IsOptional()
  @ValidateIf((o: UpdatePenghuniDto) => o.password !== undefined)
  @IsString()
  @MinLength(8, { message: 'password minimal 8 karakter' })
  @MaxLength(72)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'password harus mengandung huruf dan angka',
  })
  password?: string;
}

export class UpdateProfilDto {
  @ApiPropertyOptional({ example: 'Budi Santoso' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(3, { message: 'nama lengkap minimal 3 karakter' })
  @MaxLength(100)
  nama_lengkap?: string;

  @ApiPropertyOptional({ example: '08123456789' })
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
