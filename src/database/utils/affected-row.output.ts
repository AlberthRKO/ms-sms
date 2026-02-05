import { ApiProperty } from '@nestjs/swagger';

export class AffectedRows {
  @ApiProperty({ type: Number })
  count!: number;
}
