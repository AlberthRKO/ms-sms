import { HttpException } from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { ResponseDTO, dataResponseError } from 'fiscalia_bo-nest-helpers/dist/dto';

export const prismaFormatError = (exception: PrismaClientKnownRequestError): ResponseDTO<any> => {
  // custom error returned when generate by @unique
  let message = 'Ocurrió un error';
  let status = 422;

  const valFieldErrors = {};

  if (exception.code === 'P2000') {
    message = `Error de validación`;
    if (typeof exception.meta.column_name == 'string')
      valFieldErrors[exception.meta.column_name] = 'El contenido excede el limite';
  } else if (exception.code === 'P2002') {
    if (exception.meta.target.toString() === 'PRIMARY') {
      message = `Este id ya está registrado, el valor debe ser único`;
      valFieldErrors['id'] = 'El valor ya esta registrado y debe ser único';
    } else {
      message = `${exception.meta.target.toString()} ya está registrado, el valor debe ser único`;
      valFieldErrors[exception.meta.target.toString()] =
        'El valor ya esta registrado y debe ser único';
    }
  } else if (exception.code === 'P2003') {
    message = `Violación de restricción de relación única para ${exception.meta.field_name}`;
    valFieldErrors[exception.meta.field_name as string] =
      'El valor ya esta registrado y debe ser único';
  } else if (exception.code === 'P2004') {
    message = `Violación de restricción de clave externa`;
  } else if (exception.code === 'P2005') {
    message = `Violación de restricción de tabla`;
  } else if (exception.code === 'P2010') {
    message = exception.meta?.message as string;
  } else if (exception.code === 'P2015') {
    message = `el registro de relación no fue encontrada`;
  } else if (exception.code === 'P2016') {
    message = `Error de interpretación de consulta`;
  } else if (exception.code === 'P2020') {
    message = 'Erro de limite de caracteres o de tipo';
  } else if (exception.code === 'P2022') {
    message = `No existe la columna en db: (${exception.meta.column})`;
  } else if (exception.code === 'P2024') {
    message = 'Tiempo limite de espera por conexión excedido';
  } else if (exception.code === 'P2025') {
    message = 'Registro(s) no encontrado(s)';
    status = 404;
  } else {
    console.error('Error de prisma no controlado: ', exception);
    status = 500;
  }

  //   default error returned
  return dataResponseError(message, {
    response: {
      validationErrors:
        Object.keys(valFieldErrors).length > 0 ? JSON.stringify(valFieldErrors) : undefined,
    },
    status,
  });
};

export function errorPrismaManager(exception): ResponseDTO<any> {
  // Realiza acciones personalizadas en función de la excepción que se ha producido
  if (exception.constructor.toString() === PrismaClientKnownRequestError.toString()) {
    return prismaFormatError(exception);
  } else if (exception.constructor.toString() === PrismaClientUnknownRequestError.toString()) {
    return dataResponseError(`Excepción no controlada: ${exception.message}`, { status: 500 });
  } else if (exception.constructor.toString() === PrismaClientValidationError.toString()) {
    return dataResponseError(`Excepción no controlada: ${exception.message}`, { status: 500 });
  } else if (exception.constructor.toString() === PrismaClientInitializationError.toString()) {
    return dataResponseError(`Excepción no controlada: ${exception.message}`, { status: 500 });
  } else if (exception.constructor.toString() === PrismaClientRustPanicError.toString()) {
    return dataResponseError(`Excepción no controlada: ${exception.message}`, { status: 500 });
  } else {
    if (exception instanceof HttpException) {
      if (typeof exception.getResponse() !== 'string') {
        const respData: ResponseDTO<any> = exception.getResponse() as ResponseDTO<any>;
        if (respData.status && respData.message && typeof respData.error === 'boolean') {
          return respData;
        }
      }
    }
    return dataResponseError(`Excepción no controlada errorPrismaManager: ${exception.message}`, {
      status: 500,
    });
  }
}
