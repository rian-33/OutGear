import { ApiProperty } from '@nestjs/swagger';
import { StatusKamar } from '@kost/types';
import { IsEnum } from 'class-validator';

export class UpdateStatusKamarDto {
  /**
   * `TERISI` tidak dapat disetel langsung (FR-10) — status itu hanya berubah
   * melalui proses assign penghuni / approval pindah kamar.
   */
  @ApiProperty({ enum: [StatusKamar.KOSONG, StatusKamar.MAINTENANCE] })
  @IsEnum([StatusKamar.KOSONG, StatusKamar.MAINTENANCE] as unknown as object, {
    message: `status hanya boleh ${StatusKamar.KOSONG} atau ${StatusKamar.MAINTENANCE}`,
  })
  status!: StatusKamar;
}
