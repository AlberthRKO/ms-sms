import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { formatValidationErrorsToResponseDto } from 'fiscalia_bo-nest-helpers/dist/custom-validators/validator.sms';
import { DTO_PIPE_PLAIN_TO_CLASS_OPTIONS } from 'fiscalia_bo-nest-helpers/dist/decorators/dto.decorator';
import { ValidatorException } from '../filters/global-exception.filter';
import { ResponseDTO } from 'fiscalia_bo-nest-helpers/dist/dto';

/**
 * Pipe for validate data input in body into mutation or query
 * use mode, us   getOne(@Args('Input', MyValidatorPipe) inputDto: ChangeStatusCompilationInput)
 * use auxiliar method for validate
 */
@Injectable()
export class DtoValidatorPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    if (value === undefined) {
      return value;
    }

    const object = plainToInstance(metatype, value, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
      enableImplicitConversion: true,
    });
    // // === VALIDATIONS
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    });

    if (errors.length > 0) {
      const respValidation: ResponseDTO<any> = formatValidationErrorsToResponseDto<any>(errors);
      throw new ValidatorException(
        respValidation.message,
        respValidation.status,
        respValidation.response,
      );
    }
    // transform data
    const metadataClass = Reflect.getMetadata(DTO_PIPE_PLAIN_TO_CLASS_OPTIONS, metatype);

    const dataValue = plainToInstance(metatype, value, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
      enableImplicitConversion: true,
      ...metadataClass,
    });
    return dataValue;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
