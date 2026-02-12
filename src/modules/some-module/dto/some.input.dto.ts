import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateNested,
  IsEnum,
  IsBoolean,
  IsMongoId,
  Min,
} from 'class-validator';
import {
  smsIsStringM,
  smsMaxLength,
  smsNotEmptyM,
  smsMinInt,
} from 'fiscalia_bo-nest-helpers/dist/custom-validators/validator.sms';
import { DtoPipePlainToClassOptions } from 'fiscalia_bo-nest-helpers/dist/decorators/dto.decorator';
import { PHONE_REGEX } from 'fiscalia_bo-nest-helpers/dist/helpers';
import { MessageType, MessageStatus } from './message-status.enum';

/* ------------------------------------------------------------------------------------------------------------------ */
/* DTOs para información de Origen                                                                                    */
/* ------------------------------------------------------------------------------------------------------------------ */

@DtoPipePlainToClassOptions({ excludeExtraneousValues: true })
class UsuarioOrigenDTO {
  @Expose()
  @IsNotEmpty({ message: (v) => smsNotEmptyM(v, 'CI del usuario') })
  @IsString({ message: (v) => smsIsStringM(v, 'CI del usuario') })
  @ApiProperty({ description: 'CI del usuario', example: '14258827' })
  ci: string;

  @Expose()
  @IsNotEmpty({ message: (v) => smsNotEmptyM(v, 'nombre completo del usuario') })
  @IsString({ message: (v) => smsIsStringM(v, 'nombre completo del usuario') })
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'ALBERTO ORLANDO PAREDES MAMANI',
  })
  nombreCompleto: string;
}

@DtoPipePlainToClassOptions({ excludeExtraneousValues: true })
class OrigenDTO {
  @Expose()
  @IsNotEmpty({ message: (v) => smsNotEmptyM(v, 'aplicación') })
  @IsString({ message: (v) => smsIsStringM(v, 'aplicación') })
  @ApiProperty({ description: 'Aplicación de origen', example: 'JL-Penal' })
  aplicacion: string;

  @Expose()
  @IsNotEmpty({ message: (v) => smsNotEmptyM(v, 'módulo') })
  @IsString({ message: (v) => smsIsStringM(v, 'módulo') })
  @ApiProperty({ description: 'Módulo de origen', example: 'Login' })
  modulo: string;

  @Expose()
  @IsNotEmpty({ message: (v) => smsNotEmptyM(v, 'número de origen') })
  @Matches(PHONE_REGEX, {
    message: 'El número de origen debe ser válido, ej: +59163354864',
  })
  @Length(8, 15, {
    message: 'El número de origen debe contener entre 8 y 15 dígitos.',
  })
  @IsString({ message: (v) => smsIsStringM(v, 'número de origen') })
  @ApiProperty({ description: 'Número de origen desde donde se envía', example: '+59163354864' })
  numero: string;

  @Expose()
  @Type(() => UsuarioOrigenDTO)
  @IsNotEmpty({ message: (v) => smsNotEmptyM(v, 'usuario') })
  @ValidateNested()
  @ApiProperty({ type: UsuarioOrigenDTO, description: 'Información del usuario origen' })
  usuario: UsuarioOrigenDTO;
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* DTOs para información de Destino                                                                                   */
/* ------------------------------------------------------------------------------------------------------------------ */

@DtoPipePlainToClassOptions({ excludeExtraneousValues: true })
class DestinoDTO {
  @Expose()
  @IsNotEmpty({ message: (v) => smsNotEmptyM(v, 'número de destino') })
  @Matches(PHONE_REGEX, {
    message: 'El número de destino debe ser válido, ej: +59163354864',
  })
  @Length(8, 15, {
    message: 'El número de destino debe contener entre 8 y 15 dígitos.',
  })
  @IsString({ message: (v) => smsIsStringM(v, 'número de destino') })
  @ApiProperty({ description: 'Número de destino que recibirá el SMS', example: '+59163354864' })
  numero: string;

  @Expose()
  @IsNotEmpty({ message: (v) => smsNotEmptyM(v, 'mensaje') })
  @IsString({ message: (v) => smsIsStringM(v, 'mensaje') })
  @MaxLength(4096, { message: (v) => smsMaxLength(v, 'mensaje') })
  @ApiProperty({
    description: 'Contenido del mensaje SMS',
    example: 'Codigo ROMA: 693484',
  })
  mensaje: string;

  @Expose()
  @IsBoolean({ message: 'El campo fichero debe ser un valor booleano (true o false)' })
  @IsOptional()
  @ApiProperty({
    description: 'Indica si incluye fichero adjunto',
    default: false,
    required: false,
  })
  fichero?: boolean = false;

  @Expose()
  @IsEnum(MessageType, {
    message: 'El campo tipo debe ser "Codigo" o "Informativo"',
  })
  @ApiProperty({
    enum: MessageType,
    description: 'Tipo de mensaje: "Codigo" o "Informativo"',
    example: MessageType.CODE,
  })
  tipo: MessageType;
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* DTO Principal: Crear Mensaje                                                                                       */
/* ------------------------------------------------------------------------------------------------------------------ */

@DtoPipePlainToClassOptions({ excludeExtraneousValues: true })
export class SendMessageTextDTO {
  @Expose()
  @Type(() => OrigenDTO)
  @IsNotEmpty({ message: (v) => smsNotEmptyM(v, 'origen') })
  @ValidateNested()
  @ApiProperty({ type: OrigenDTO, description: 'Información de origen del mensaje' })
  origen: OrigenDTO;

  @Expose()
  @Type(() => DestinoDTO)
  @IsNotEmpty({ message: (v) => smsNotEmptyM(v, 'destino') })
  @ValidateNested()
  @ApiProperty({ type: DestinoDTO, description: 'Información de destino del mensaje' })
  destino: DestinoDTO;
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* DTO: Actualizar Estado del Mensaje                                                                                */
/* ------------------------------------------------------------------------------------------------------------------ */

@DtoPipePlainToClassOptions({ excludeExtraneousValues: true })
export class UpdateMessageStatusDTO {
  @Expose()
  @IsMongoId({ message: 'El campo messageId debe ser un ObjectId válido' })
  @ApiProperty({ description: 'ID del mensaje', example: '698c7c7c3f52a806f3dea18d' })
  messageId: string;

  @Expose()
  @IsEnum(MessageStatus, {
    message: 'El campo estado debe ser "Pendiente", "Enviado" o "Fallido"',
  })
  @ApiProperty({
    enum: MessageStatus,
    description: 'Nuevo estado del mensaje: "Pendiente", "Enviado" o "Fallido"',
    example: MessageStatus.SENT,
  })
  estado: MessageStatus;
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* DTO: Listar Mensajes con Filtros                                                                                  */
/* ------------------------------------------------------------------------------------------------------------------ */

@DtoPipePlainToClassOptions({ excludeExtraneousValues: true })
export class ListMessagesQueryDTO {
  @Expose()
  @IsEnum(MessageType, {
    message: 'El campo tipo debe ser "Codigo" o "Informativo"',
  })
  @IsOptional()
  @ApiProperty({
    enum: MessageType,
    required: false,
    description: 'Filtrar por tipo de mensaje: "Codigo" o "Informativo"',
  })
  tipo?: MessageType;

  @Expose()
  @IsEnum(MessageStatus, {
    message: 'El campo estado debe ser "Pendiente", "Enviado" o "Fallido"',
  })
  @IsOptional()
  @ApiProperty({
    enum: MessageStatus,
    required: false,
    description: 'Filtrar por estado: "Pendiente", "Enviado" o "Fallido"',
  })
  estado?: MessageStatus;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Filtrar por número de destino',
    example: '+59163354864',
  })
  numero?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Filtrar por aplicación de origen',
    example: 'JL-Penal',
  })
  aplicacion?: string;

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
  @Min(1, { message: smsMinInt })
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Cantidad de registros por página',
    default: 10,
    example: 10,
  })
  limit?: number = 10;
}
