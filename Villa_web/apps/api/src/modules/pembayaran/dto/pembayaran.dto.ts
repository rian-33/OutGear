import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MetodeBayar, StatusPembayaran } from '@kost/types';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { SortOrderDto } from '../../../common/dto/pagination.dto';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreatePembayaranDto {
  @ApiProperty({ example: 'cm123abc456', description: 'id_tagihan yang dibayar' })
  @IsString()
  @MinLength(1)
  id_tagihan!: string;

  @ApiProperty({ example: 750000, description: 'Nominal yang dibayar (harus >= sisa tagihan)' })
  @Transform(({ value }) => (typeof value === 'string' ? Number(value.replace(/\D/g, '')) : value))
  @IsInt({ message: 'jumlah_bayar harus bilangan bulat (Rupiah tanpa sen)' })
  @Min(1, { message: 'nominal minimal Rp 1' })
  @Max(1_000_000_000)
  jumlah_bayar!: number;

  @ApiProperty({ enum: MetodeBayar })
  @IsEnum(MetodeBayar)
  metode!: MetodeBayar;

  @ApiPropertyOptional({
    example: 'BCA-123-20260929',
    description: 'Catatan referensi transfer',
  })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(3)
  @Matches(/^[\w\-./ ]{3,120}$/, {
    message: 'catatan referensi hanya boleh huruf, angka, spasi, dan karakter - _ . /',
  })
  catatan?: string;
}

export class KonfirmasiPembayaranDto {
  @ApiPropertyOptional({ example: 'Dana masuk, bukti sesuai.', maxLength: 255 })
  @IsOptional()
  @Transform(trim)
  @IsString()
  catatan_admin?: string;
}

export class TolakPembayaranDto {
  @ApiProperty({ example: 'Bukti transfer tidak terbaca.', description: 'Wajib diisi (FR-26)' })
  @Transform(trim)
  @IsString()
  @MinLength(5, { message: 'alasan penolakan wajib diisi minimal 5 karakter agar penghuni paham' })
  @MaxLength(500)
  alasan_tolak!: string;
}

export class QueryPembayaranDto extends SortOrderDto {
  @ApiPropertyOptional({ enum: StatusPembayaran })
  @IsOptional()
  @IsEnum(StatusPembayaran)
  status?: StatusPembayaran;

  @ApiPropertyOptional({ enum: MetodeBayar })
  @IsOptional()
  @IsEnum(MetodeBayar)
  metode?: MetodeBayar;

  @ApiPropertyOptional({ example: 'cm123abc456', description: 'Filter tagihan tertentu (admin)' })
  @IsOptional()
  @IsString()
  id_tagihan?: string;
}
