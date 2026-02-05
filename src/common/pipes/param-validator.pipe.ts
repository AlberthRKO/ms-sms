/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { paramTypeValidator } from 'fiscalia_bo-nest-helpers/dist/custom-validators/validator.functions';

/**
 * Pipe for validate data input in body into mutation or query
 * use mode, us   getOne(@Args('Input', MyValidatorPipe) inputDto: ChangeStatusCompilationInput)
 * use auxiliar method for validate
 */
@Injectable()
export class ParamValidatorPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    if (!metatype || this.toValidate(metatype)) {
      return value;
    }

    if (value === undefined || value === null) {
      return value;
    }
    return paramTypeValidator(value, metatype);
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
