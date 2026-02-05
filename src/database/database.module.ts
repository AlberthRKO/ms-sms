import { Global, Module } from '@nestjs/common';
import { PgPrismaService } from './pg-prisma.service';

@Global()
@Module({
  providers: [PgPrismaService],
  exports: [PgPrismaService],
})
export class DatabaseModule {}
