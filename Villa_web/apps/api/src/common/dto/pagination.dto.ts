import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export const MAX_PAGE_SIZE = 100;

/** Query dasar untuk seluruh endpoint list (PRD-4 §2 — list harus terpaginasikan). */
export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: MAX_PAGE_SIZE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  perPage = 20;

  get skip(): number {
    return (this.page - 1) * this.perPage;
  }

  get take(): number {
    return this.perPage;
  }
}

/** Bentuk response list yang konsisten di seluruh API. */
export class Paginated<T> {
  @ApiProperty({ isArray: true })
  data!: T[];

  @ApiProperty()
  meta!: {
    page: number;
    perPage: number;
    total: number;
    totalPage: number;
  };

  static of<T>(data: T[], total: number, page: number, perPage: number): Paginated<T> {
    return {
      data,
      meta: {
        page,
        perPage,
        total,
        totalPage: perPage > 0 ? Math.ceil(total / perPage) : 0,
      },
    };
  }
}

/** Urutan hasil list yang diizinkan (whitelist — cegah sort injection). */
export class SortOrderDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}
