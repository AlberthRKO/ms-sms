import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, TransformFnParams, Type } from 'class-transformer';
import { IsBase64, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';
import {
  smsBase64,
  smsIsString,
  smsIsStringF,
  smsIsStringM,
  smsLength,
  smsMinLength,
  smsNotEmpty,
  smsNotEmptyF,
  smsNotEmptyM,
} from 'fiscalia_bo-nest-helpers/dist/custom-validators/validator.sms';

/* ------------------------------------ input file in base64 ------------------------------------ */
export class InputFileDto {
  @Expose()
  @Transform(({ value }: TransformFnParams) => (value ? value.toString().trim() : value))
  @Type(() => String)
  @Length(4, 100, { message: (v) => smsLength(v) })
  @IsString({ message: (v) => smsIsStringM(v) })
  @IsNotEmpty({ message: smsNotEmpty })
  @ApiProperty({ description: 'Nombre original de archivo, ej: mi foto.png', required: true })
  nombre!: string;

  @Expose()
  @IsBase64({}, { message: (v) => smsBase64(v) })
  @MinLength(3, { message: (v) => smsMinLength(v) })
  @IsString({ message: (v) => smsIsStringM(v) })
  @IsNotEmpty({ message: (v) => smsNotEmptyM(v) })
  @IsString({ message: (v) => smsIsString(v, 'archivo en base64') })
  @ApiProperty({ description: 'archivo en base64', required: true })
  archivoBase64!: string;

  @Expose()
  @Transform(({ value }: TransformFnParams) => (value ? value.trim() : value))
  @Length(2, 10, { message: (v) => smsLength(v, 'La extensión') })
  @IsString({ message: (v) => smsIsStringF(v, 'extensión') })
  @IsNotEmpty({ message: (v) => smsNotEmptyF(v, 'extensión') })
  @ApiProperty({
    description: 'extension del archivo, ejemplo: .jpg, .png, .pdf',
    required: true,
    example: '.jpg, .png, .pdf',
  })
  extension!: string;
}
