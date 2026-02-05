import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString, Matches, MaxLength, Min } from 'class-validator';
import {
  smsInteger,
  smsIsString,
} from 'fiscalia_bo-nest-helpers/dist/custom-validators/validator.sms';
import { IsSQLInjectionSafe } from 'fiscalia_bo-nest-helpers/dist/decorators/validator.decorator';

interface ParamsStringValidatorOptions {
  description?: string;
  example?: string;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
  required?: boolean;
  format?: string;
}

interface ParamsIntValidatorOptions {
  description?: string;
  example?: number;
  min?: number;
  required?: boolean;
}

/**
 * Decorador compuesto para validar parámetros de tipo string en rutas
 * Previene SQL injection y valida formato seguro
 *
 * @param options - Opciones de configuración
 * @param options.description - Descripción del parámetro para Swagger
 * @param options.example - Ejemplo de valor para Swagger
 * @param options.maxLength - Longitud máxima permitida (default: 100)
 * @param options.pattern - Patrón regex personalizado (default: /^[a-zA-Z0-9_-]+$/)
 * @param options.patternMessage - Mensaje personalizado para validación de patrón
 * @param options.required - Si el campo es requerido (default: true)
 *
 * @example
 * ```typescript
 * export class MiDto {
 *   @ParamsStringValidator({ description: 'Código', example: 'ABC123' })
 *   codigo: string;
 * }
 * ```
 */
export function ParamsStringValidator(options: ParamsStringValidatorOptions = {}) {
  const {
    description = 'Parámetro de texto',
    example = 'ABC123',
    maxLength = 100,
    pattern = /^[a-zA-Z0-9_-]+$/,
    patternMessage = 'El parámetro solo puede contener letras, números, guiones y guiones bajos',
    required = true,
    format,
  } = options;

  const apiPropertyOptions: ApiPropertyOptions = {
    description,
    type: String,
    example,
    required,
    format,
  };

  return applyDecorators(
    Expose(),
    ApiProperty(apiPropertyOptions),
    Type(() => String),
    IsString({ message: (v) => smsIsString(v) }),
    IsSQLInjectionSafe(),
    MaxLength(maxLength, {
      message: `El parámetro no debe exceder ${maxLength} caracteres`,
    }),
    Matches(pattern, { message: patternMessage }),
  );
}

/**
 * Decorador compuesto para validar parámetros de tipo entero en rutas
 * Previene SQL injection validando que solo sean números enteros positivos
 *
 * @param options - Opciones de configuración
 * @param options.description - Descripción del parámetro para Swagger
 * @param options.example - Ejemplo de valor para Swagger
 * @param options.min - Valor mínimo permitido (default: 1)
 * @param options.required - Si el campo es requerido (default: true)
 * @param options.optional - Si el campo es opcional, anula required (default: false)
 *
 * @example
 * ```typescript
 * export class MiDto {
 *   @ParamsIntValidator({ description: 'ID del usuario', example: 123 })
 *   usuarioId: number;
 *
 *   @ParamsIntValidator({ description: 'ID opcional', optional: true })
 *   categoriaId?: number;
 * }
 * ```
 */
export function ParamsIntValidator(
  options: ParamsIntValidatorOptions & { optional?: boolean } = {},
) {
  const {
    description = 'ID numérico',
    example = 1,
    min = 1,
    required = true,
    optional = false,
  } = options;

  const isRequired = optional ? false : required;

  const apiPropertyOptions: ApiPropertyOptions = {
    description,
    type: Number,
    example,
    required: isRequired,
  };

  const decorators = [
    Expose(),
    ApiProperty(apiPropertyOptions),
    Type(() => Number),
    IsInt({ message: (v) => smsInteger(v) }),
    IsPositive({ message: 'El ID debe ser un número positivo' }),
    Min(min, { message: `El ID debe ser mayor o igual a ${min}` }),
  ];

  // Si es opcional, agregar IsOptional al inicio de las validaciones
  if (optional) {
    decorators.splice(2, 0, IsOptional());
  }

  return applyDecorators(...decorators);
}
