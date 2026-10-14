import { IsDateString, IsEmail, IsEnum, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusReservasi } from '@kost/types';

export class DateRangeDto {
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  check_in!: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  check_out!: string;

}

export class CheckAvailabilityDto extends DateRangeDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  jumlah_tamu?: number;
}

export class CreateReservasiDto extends DateRangeDto {
  @IsString()
  id_kamar!: string;

  @IsString()
  @MaxLength(100)
  nama_tamu!: string;

  @IsString()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MaxLength(40)
  no_hp!: string;

  @IsInt()
  @Min(1)
  @Max(20)
  jumlah_tamu!: number;

  @IsOptional()
  @IsString()
  catatan?: string;
}

export class UpdateReservasiDto {
  @IsEnum(StatusReservasi)
  status!: StatusReservasi;
}
