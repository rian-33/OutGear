import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusKamar } from '@kost/types';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SortOrderDto } from '../../../common/dto/pagination.dto';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class QueryKamarDto extends SortOrderDto {
  @ApiPropertyOptional({ enum: StatusKamar })
  @IsOptional()
  @IsEnum(StatusKamar)
  status?: StatusKamar;

  @ApiPropertyOptional({ example: 'Garden', description: 'Pencarian nama unit villa' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(50)
  search?: string;
}
