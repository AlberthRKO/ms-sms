import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { smsIsBoolean } from 'fiscalia_bo-nest-helpers/dist/custom-validators/validator.sms';

interface QueryBooleanValidatorOptions {
  description: string;
  default: boolean;
  required?: boolean;
  example?: boolean;
}

/**
 * Decorador compuesto para validar query parameters de tipo boolean
 * Transforma strings ('true', 'false', '1', '0') a valores booleanos
 *
 * @param options - Opciones de configuración
 * @param options.description - Descripción del parámetro para Swagger
 * @param options.example - Ejemplo de valor para Swagger
 * @param options.required - Si el campo es requerido (default: false)
 * @param options.default - Valor por defecto si no se proporciona
 *
 * @example
 * ```typescript
 * export class MiQueryDto {
 *   @QueryBooleanValidator({
 *     description: 'Incluir contenido texto',
 *     default: false
 *   })
 *   includeArchived?: boolean;
 * }
 * ```
 */
export function QueryBooleanValidator(options: QueryBooleanValidatorOptions) {
  const { description, default: defaultValue, example = false, required = false } = options;

  const apiPropertyOptions: ApiPropertyOptions = {
    description,
    type: Boolean,
    example,
    required,
    default: defaultValue,
  };

  const decorators = [
    Expose(),
    ApiProperty(apiPropertyOptions),
    // Transforma strings a boolean (query params vienen como strings)
    Transform(({ obj, key }) => {
      // Acceder al valor original del objeto, no al valor ya transformado
      const value = obj[key];

      if (value === undefined || value === null) {
        return defaultValue !== undefined ? defaultValue : value;
      }
      if (typeof value === 'boolean') return value;
      if (value === 'true' || value === '1') return true;
      if (value === 'false' || value === '0') return false;
      return value;
    }),
    Type(() => Boolean),
    IsBoolean({ message: (v) => smsIsBoolean(v) }),
  ];

  // Si no es requerido, agregar IsOptional
  if (!required) {
    decorators.splice(1, 0, IsOptional());
  }

  return applyDecorators(...decorators);
}
