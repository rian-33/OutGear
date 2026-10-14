import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateKamarDto {
  @ApiProperty({ example: 'Garden Suite 1' })
  @Transform(trim)
  @IsString()
  @Matches(/^[A-Za-z0-9][A-Za-z0-9 /-]{0,49}$/, {
    message: 'nama unit hanya boleh berisi huruf, angka, spasi, strip, atau garis miring (maks 50 karakter)',
  })
  no_kamar!: string;

  @ApiProperty({ example: 2, description: 'Kapasitas maksimum tamu' })
  @IsInt()
  @Min(1)
  @Max(20)
  kapasitas!: number;

  @ApiProperty({ example: 1250000, description: 'Harga per malam dalam Rupiah' })
  @Transform(({ value }) => (typeof value === 'string' ? Number(value.replace(/\D/g, '')) : value))
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'harga harus berupa angka' })
  @IsInt({ message: 'harga harus bilangan bulat (Rupiah tanpa sen)' })
  @Min(0, { message: 'harga tidak boleh negatif' })
  @Max(1_000_000_000, { message: 'harga melebihi batas maksimum yang masuk akal' })
  harga!: number;

  @ApiPropertyOptional({ example: 'Kasur, Lemari, Meja Belajar, WiFi' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  fasilitas?: string;
}
