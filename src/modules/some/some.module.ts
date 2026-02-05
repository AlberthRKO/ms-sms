import { SomeController } from './some.controller';
import { Global, Module } from '@nestjs/common';
import { SomeService } from './some.service';

@Global()
@Module({
  imports: [],
  controllers: [SomeController],
  providers: [SomeService],
  exports: [SomeService],
})
export class SomeModule {}
