import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusTagihan } from '@kost/types';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { SortOrderDto } from '../../../common/dto/pagination.dto';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateTagihanManualDto {
  @ApiProperty({ example: 'cm123abc456', description: 'id_user penghuni' })
  @IsString()
  @MinLength(1)
  id_user!: string;

  @ApiPropertyOptional({
    example: 750000,
    description: 'Nominal tagihan; default memakai harga kamar',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? Number(value.replace(/\D/g, '')) : value))
  @IsInt({ message: 'jumlah harus bilangan bulat (Rupiah tanpa sen)' })
  @Min(1, { message: 'jumlah minimal Rp 1' })
  @Max(1_000_000_000)
  jumlah?: number;

  @ApiPropertyOptional({ example: '2026-10', description: 'Periode tagihan YYYY-MM' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'periode harus berformat YYYY-MM' })
  periode?: string;

  @ApiPropertyOptional({ example: '2026-10-10', description: 'Tanggal jatuh tempo (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'jatuh_tempo harus berformat YYYY-MM-DD' })
  jatuh_tempo?: string;

  @ApiPropertyOptional({ example: 'Denda keterlambatan September', maxLength: 255 })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(3)
  catatan?: string;
}

export class QueryTagihanDto extends SortOrderDto {
  @ApiPropertyOptional({ enum: StatusTagihan })
  @IsOptional()
  @IsEnum(StatusTagihan)
  status?: StatusTagihan;

  @ApiPropertyOptional({ example: '2026-09' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'periode harus berformat YYYY-MM' })
  periode?: string;

  @ApiPropertyOptional({ example: 'cm123abc456', description: 'Filter penghuni tertentu (admin)' })
  @IsOptional()
  @IsString()
  id_user?: string;

  @ApiPropertyOptional({
    example: '2026-09-01',
    description: 'Filter jatuh tempo dari tanggal ini',
  })
  @IsOptional()
  @IsDateString()
  dari?: string;

  @ApiPropertyOptional({
    example: '2026-09-30',
    description: 'Filter jatuh tempo sampai tanggal ini',
  })
  @IsOptional()
  @IsDateString()
  sampai?: string;
}
