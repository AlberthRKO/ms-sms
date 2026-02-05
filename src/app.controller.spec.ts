import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health check response', () => {
      const result = appController.getHealth();
      expect(result.error).toBe(false);
      expect(result.status).toBe(200);
      expect(result.response.data).toHaveProperty('author');
      expect(result.response.data).toHaveProperty('dateTimeServer');
      expect(result.response.data).toHaveProperty('nameApp');
      expect(result.response.data).toHaveProperty('version');
    });
  });
});
