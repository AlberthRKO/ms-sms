import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDefined, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DtoPipePlainToClassOptions } from 'fiscalia_bo-nest-helpers/dist/decorators/dto.decorators';
import { smsIsStringM } from 'fiscalia_bo-nest-helpers/dist/custom-validators/validator.sms';
import { ENVIRONMENT_ENUM } from 'fiscalia_bo-nest-helpers/dist/dto';

@DtoPipePlainToClassOptions({ excludeExtraneousValues: true })
export class MainFortinetDto {
  @Expose()
  @ApiProperty({ enum: ENVIRONMENT_ENUM })
  @IsDefined({ message: 'El campo modo de servicio es obligatorio.' })
  @IsEnum(ENVIRONMENT_ENUM, {
    message: 'El campo modo de servicio debe ser uno de los siguientes: prod, dev, test, stage',
  })
  mode: ENVIRONMENT_ENUM;

  @Expose()
  @IsString({ message: (v) => smsIsStringM(v, 'tag de aplicacion') })
  @IsNotEmpty()
  @ApiProperty({ description: 'tag de aplicacion', example: 'unia, mp' })
  application: string;
}

@DtoPipePlainToClassOptions({ excludeExtraneousValues: true })
export class SendCodeDto extends MainFortinetDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1234' })
  someData: string;
}
