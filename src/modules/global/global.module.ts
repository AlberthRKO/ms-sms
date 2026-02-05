import { Global, Module } from '@nestjs/common';
import { GlobalService } from './global.service';

@Global()
@Module({
  imports: [],
  providers: [GlobalService],
  exports: [GlobalService],
})
export class GlobalModule {}
