import { ArgumentMetadata } from '@nestjs/common';
import { ParamValidatorPipe } from './param-validator.pipe';

describe('ParamValidatorPipe', () => {
  let pipe: ParamValidatorPipe;

  beforeEach(() => {
    pipe = new ParamValidatorPipe();
  });

  it('debería retornar el valor si no hay metatype', async () => {
    const value = 'test';
    const metadata: ArgumentMetadata = {
      type: 'param',
      data: '',
    };
    const result = await pipe.transform(value, metadata);
    expect(result).toBe(value);
  });

  it('debería retornar el valor si el metatype es un tipo primitivo', async () => {
    const value = 'test';
    const metadata: ArgumentMetadata = {
      type: 'param',
      metatype: String,
      data: '',
    };
    const result = await pipe.transform(value, metadata);
    expect(result).toBe(value);
  });

  it('debería validar y transformar un número', async () => {
    const value = '123';
    const metadata: ArgumentMetadata = {
      type: 'param',
      metatype: Number,
      data: '',
    };
    const result = await pipe.transform(value, metadata);
    expect(result).toBe(123);
  });

  it('debería validar y transformar un booleano', async () => {
    const value = 'true';
    const metadata: ArgumentMetadata = {
      type: 'param',
      metatype: Boolean,
      data: '',
    };
    const result = await pipe.transform(value, metadata);
    expect(result).toBe(true);
  });

  it('debería retornar el valor original para un array', async () => {
    const value = '["a","b","c"]';
    const metadata: ArgumentMetadata = {
      type: 'param',
      metatype: Array,
      data: '',
    };
    const result = await pipe.transform(value, metadata);
    expect(result).toBe(value);
  });

  it('debería retornar el valor original para un objeto', async () => {
    const value = '{"key":"value"}';
    const metadata: ArgumentMetadata = {
      type: 'param',
      metatype: Object,
      data: '',
    };
    const result = await pipe.transform(value, metadata);
    expect(result).toBe(value);
  });
});
