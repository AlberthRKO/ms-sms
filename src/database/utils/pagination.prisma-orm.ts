import { ApiProperty } from '@nestjs/swagger';

/* -------------------------------------- pagination order -------------------------------------- */
export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

/* ---------------------------------------- basic Fields ---------------------------------------- */
export class PaginationArgs {
  @ApiProperty({ type: Number, nullable: true, description: '' })
  page?: number;

  @ApiProperty({ type: Number, nullable: true, description: '' })
  limit?: number;

  @ApiProperty({ type: String, nullable: true })
  searchText?: string;
}

/* ------------------------------------- pagination response ------------------------------------ */
class PaginationInfo {
  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: Number, nullable: true, description: '' })
  from?: number;

  @ApiProperty({ type: Number, nullable: true, description: '' })
  limit?: number;

  @ApiProperty({ type: Number, nullable: true, description: '' })
  page?: number;
}

export class PaginationResponse {
  @ApiProperty({ type: PaginationInfo, nullable: true })
  pagination?: PaginationInfo;
}

export interface PrismaSelectI {
  select: object;
}

export interface SelectPaginate {
  pagination: PaginationInfo;
  data: { select: object };
}
