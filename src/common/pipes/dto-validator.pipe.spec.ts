import { ArgumentMetadata } from '@nestjs/common';
import { DtoValidatorPipe } from './dto-validator.pipe';
import { IsString, Length } from 'class-validator';
import { Expose } from 'class-transformer';

class TestDto {
  @Expose()
  @IsString()
  @Length(5, 10)
  name: string;
}

describe('DtoValidatorPipe', () => {
  let pipe: DtoValidatorPipe;
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: TestDto,
    data: '',
  };

  beforeEach(() => {
    pipe = new DtoValidatorPipe();
  });

  it('debería validar y transformar datos correctos', async () => {
    const value = { name: 'test123' };
    const result = await pipe.transform(value, metadata);
    expect(result).toBeDefined();
    expect(result.name).toBe('test123');
  });

  it('debería retornar el valor si no hay metatype', async () => {
    const value = { name: 'test' };
    const metadataWithoutMetatype: ArgumentMetadata = {
      type: 'body',
      data: '',
    };
    const result = await pipe.transform(value, metadataWithoutMetatype);
    expect(result).toEqual(value);
  });

  it('debería retornar el valor si es undefined', async () => {
    const value = undefined;
    const result = await pipe.transform(value, metadata);
    expect(result).toBeUndefined();
  });

  it('debería retornar el valor si el metatype es un tipo primitivo', async () => {
    const value = 'test';
    const metadataString: ArgumentMetadata = {
      type: 'body',
      metatype: String,
      data: '',
    };
    const result = await pipe.transform(value, metadataString);
    expect(result).toBe(value);
  });

  it('debería lanzar error si la validación falla', async () => {
    const value = { name: 'a' }; // nombre muy corto
    await expect(pipe.transform(value, metadata)).rejects.toThrow();
  });
});
