import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, Matches } from 'class-validator';

const parse = ({ value }: { value: unknown }): unknown => value;

export class LaporanQueryDto {
  @ApiProperty({ example: '2026-01-01', description: 'Tanggal mulai (YYYY-MM-DD)' })
  @Transform(parse)
  @IsDateString({ strict: false })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dari harus berformat YYYY-MM-DD' })
  dari!: string;

  @ApiProperty({ example: '2026-12-31', description: 'Tanggal akhir (YYYY-MM-DD)' })
  @Transform(parse)
  @IsDateString({ strict: false })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'sampai harus berformat YYYY-MM-DD' })
  sampai!: string;
}
