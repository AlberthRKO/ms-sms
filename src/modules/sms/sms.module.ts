import { Module } from '@nestjs/common';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './dto/sms.schema';
import { SmsGateway } from './sms.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema, collection: 'messages' },
    ]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [SmsController],
  providers: [SmsService, SmsGateway],
  exports: [SmsService],
})
export class SmsModule {}
