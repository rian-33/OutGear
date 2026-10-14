import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@kost/types';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SortOrderDto } from '../../../common/dto/pagination.dto';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class QueryUsersDto extends SortOrderDto {
  @ApiPropertyOptional({ example: 'budi', description: 'Pencarian nama lengkap atau username' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ description: 'Filter berdasarkan status kamar yang ditempati' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  tanpa_kamar?: boolean;
}
