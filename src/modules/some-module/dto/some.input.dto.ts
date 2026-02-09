import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import {
  smsIsStringM,
  smsMaxLength,
  smsMinInt,
  smsNotEmptyM,
} from 'fiscalia_bo-nest-helpers/dist/custom-validators/validator.sms';
import { DtoPipePlainToClassOptions } from 'fiscalia_bo-nest-helpers/dist/decorators/dto.decorator';
import { PHONE_REGEX } from 'fiscalia_bo-nest-helpers/dist/helpers';
import { ENVIRONMENT_ENUM } from 'fiscalia_bo-nest-helpers/dist/dto';
import { MessageType, MessageStatus } from './message-status.enum';

@DtoPipePlainToClassOptions({ excludeExtraneousValues: true })
class UserSend {
  @Expose()
  @IsNotEmpty({ message: (v) => smsNotEmptyM(v) })
  @ApiProperty({ description: 'ci del usuario' })
  ci: string;

  @Expose()
  @IsNotEmpty({ message: (v) => smsNotEmptyM(v, 'nombre de usuario') })
  @IsString({ message: (v) => smsIsStringM(v, 'nombre de usuario') })
  @ApiProperty({ description: 'nombreCompleto debe ser un objeto' })
  nombreCompleto: string;

  /* ------------------------------------------------- optional fields ------------------------------------------------ */

  @Expose()
  @Min(0, { message: smsMinInt })
  @IsOptional()
  @ApiProperty({ description: 'msPersonaId debe ser un numero', required: false })
  msPersonaId?: number;

  @Expose()
  @IsOptional()
  @ApiProperty({ description: 'funcionarioId debe ser un numero', required: false })
  funcionarioId?: number;

  @Expose()
  @IsOptional()
  @ApiProperty({ description: 'institucionId debe ser un numero', required: false })
  institucionId?: number;

  @Expose()
  @IsOptional()
  @ApiProperty({ description: 'oficinaId debe ser un numero', required: false })
  oficinaId?: number;
}

@DtoPipePlainToClassOptions({ excludeExtraneousValues: true })
export class SendMessageTextDTO {
  @Expose()
  @IsEnum(ENVIRONMENT_ENUM, {
    message: 'El campo modo de servicio debe ser uno de los siguientes: prod, dev, test, stage',
  })
  @IsOptional()
  @ApiProperty({ enum: ENVIRONMENT_ENUM, default: ENVIRONMENT_ENUM.PROD, required: false })
  mode?: ENVIRONMENT_ENUM;

  @Expose()
  @IsNotEmpty({ message: (v) => smsNotEmptyM(v, 'número de celular') })
  @Matches(PHONE_REGEX, {
    message: 'El campo phone debe contener números telefonicos, ej: +591 78945612 o 59178945612',
  })
  @Length(8, 15, {
    message: 'El campo phone debe contener exactamente minimo 8 dígitos y maximo 15.',
  })
  @IsString({ message: (v) => smsIsStringM(v, 'número de celular') })
  @ApiProperty({
    description:
      'numero de celular habilitado en message, incluido codigo de pais, ejemplo: 59178945612, +59178945612',
    example: '+59178945612',
  })
  phone: string;

  @Expose()
  @IsNotEmpty({ message: (v) => smsNotEmptyM(v, 'mensaje') })
  @IsString({ message: (v) => smsIsStringM(v, 'mensaje') })
  @MaxLength(4096, { message: (v) => smsMaxLength(v, 'mensaje') })
  @ApiProperty({
    type: String,
    description: 'message debe ser cadena de texto',
  })
  message: string;

  @Expose()
  @IsNotEmpty({ message: (v) => smsNotEmptyM(v, 'aplicacion') })
  @IsString({ message: (v) => smsIsStringM(v, 'aplicacion') })
  @ApiProperty({ type: String, description: 'app debe ser cadena de texto' })
  app: string;

  @Expose()
  @Type(() => UserSend)
  @IsNotEmpty({ message: (v) => smsNotEmptyM(v, 'usuario') })
  @ValidateNested()
  @ApiProperty({ type: UserSend, description: 'user debe ser un objeto' })
  user: UserSend;

  @Expose()
  @IsEnum(MessageType, {
    message: 'El campo messageType debe ser 1 (SMS con código) o 2 (mensaje informativo)',
  })
  @ApiProperty({
    enum: MessageType,
    description: 'Tipo de mensaje: 1=SMS con código, 2=mensaje informativo',
    example: MessageType.CODE,
  })
  messageType: MessageType;
}

@DtoPipePlainToClassOptions({ excludeExtraneousValues: true })
export class UpdateMessageStatusDTO {
  @Expose()
  @IsMongoId({ message: 'El campo messageId debe ser un ObjectId válido' })
  @ApiProperty({ description: 'ID del mensaje', example: '67a42c2a88453f4c8d5b9d0e' })
  messageId: string;

  @Expose()
  @IsEnum(MessageStatus, {
    message: 'El campo status debe ser 0 (pendiente), 1 (enviado) o 2 (fallido)',
  })
  @ApiProperty({
    enum: MessageStatus,
    description: 'Nuevo estado del mensaje: 0=pendiente, 1=enviado, 2=fallido',
    example: MessageStatus.SENT,
  })
  status: MessageStatus;
}

@DtoPipePlainToClassOptions({ excludeExtraneousValues: true })
export class ListMessagesQueryDTO {
  @Expose()
  @IsEnum(MessageType, {
    message: 'El campo messageType debe ser 1 (SMS con código) o 2 (mensaje informativo)',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @ApiProperty({
    enum: MessageType,
    required: false,
    description: 'Filtrar por tipo de mensaje: 1=SMS con código, 2=mensaje informativo',
  })
  messageType?: MessageType;

  @Expose()
  @IsEnum(MessageStatus, {
    message: 'El campo status debe ser 0 (pendiente), 1 (enviado) o 2 (fallido)',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @ApiProperty({
    enum: MessageStatus,
    required: false,
    description: 'Filtrar por estado: 0=pendiente, 1=enviado, 2=fallido',
  })
  status?: MessageStatus;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Filtrar por número de teléfono',
    example: '+59178945612',
  })
  phone?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Filtrar por aplicación',
    example: 'UNIA',
  })
  app?: string;

  @Expose()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @Min(1, { message: 'La página debe ser mayor o igual a 1' })
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Número de página',
    default: 1,
    example: 1,
  })
  page?: number = 1;

  @Expose()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Cantidad de registros por página',
    default: 10,
    example: 10,
  })
  limit?: number = 10;
}
