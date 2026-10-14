import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusPengajuan } from '@kost/types';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SortOrderDto } from '../../../common/dto/pagination.dto';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreatePengajuanDto {
  @ApiProperty({ example: 'cm123abc456', description: 'id_kamar tujuan (wajib berstatus KOSONG)' })
  @IsString()
  @MinLength(1)
  id_kamar_baru!: string;

  @ApiPropertyOptional({ example: 'Kamar manda dalam dekat, lebih nyaman.', maxLength: 500 })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(3, { message: 'alasan minimal 3 karakter' })
  @MaxLength(500)
  alasan?: string;
}

export class SetujuiPengajuanDto {
  @ApiPropertyOptional({ example: 'Selamat, kamar baru sudah disiapkan.', maxLength: 500 })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  catatan_admin?: string;
}

export class TolakPengajuanDto {
  @ApiProperty({
    example: 'Kamar tujuan sedang dipakai untuk perbaikan.',
    description: 'Wajib diisi (FR-31)',
  })
  @Transform(trim)
  @IsString()
  @MinLength(5, { message: 'catatan admin wajib diisi minimal 5 karakter' })
  @MaxLength(500)
  catatan_admin!: string;
}

export class QueryPengajuanDto extends SortOrderDto {
  @ApiPropertyOptional({ enum: StatusPengajuan })
  @IsOptional()
  @IsEnum(StatusPengajuan)
  status?: StatusPengajuan;
}
