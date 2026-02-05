import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Expose, Transform, TransformFnParams } from 'class-transformer';
import { IsIn, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @Expose()
  @ApiPropertyOptional({ required: false, description: 'Página iniciando en 1', default: 0 })
  @Transform(({ value }: TransformFnParams) =>
    value && !Number.isNaN(value) ? Number(value) : value,
  )
  @IsOptional()
  @Min(0)
  @Expose()
  page?: number;

  @Expose()
  @ApiPropertyOptional({ required: false, description: 'Tamaño de página', default: 10 })
  @Transform(({ value }: TransformFnParams) =>
    value && !Number.isNaN(value) ? Number(value) : value,
  )
  @IsOptional()
  @Min(1)
  @Max(1000)
  @Expose()
  size?: number;
}

export class OrderQueryDto {
  @Expose()
  @ApiPropertyOptional({ required: false, description: 'Campo por el cual ordenar' })
  @IsOptional()
  @IsString()
  @Expose()
  orderBy?: string;

  @Expose()
  @ApiPropertyOptional({
    required: false,
    enum: ['asc', 'desc'],
    description: 'Dirección de orden',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  @Expose()
  orderDirection?: 'asc' | 'desc';
}

export class BaseFilterDto extends IntersectionType(PaginationQueryDto, OrderQueryDto) {}

export class ListFindAllQueryDto extends IntersectionType(PaginationQueryDto, OrderQueryDto) {}
