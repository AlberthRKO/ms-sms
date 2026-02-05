import {
  ExceptionFilter,
  Catch,
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
  HttpException,
  NotAcceptableException,
  UnauthorizedException,
  ForbiddenException,
  ArgumentsHost,
  Logger,
} from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { FastifyReply, FastifyRequest } from 'fastify';
import { IResponseDTO } from 'fiscalia_bo-nest-helpers/dist/dto';
import { printRequestUrl } from 'fiscalia_bo-nest-helpers/dist/http-service';

const printRequestBodyLog = (host: ArgumentsHost, status: number, validations: any) => {
  const request = host.switchToHttp().getRequest<FastifyRequest>();
  const url = request?.url;
  Logger.warn(`status ${status}, IP: ${request?.ip}, URL: ${url}`);

  const data = request?.body; // Puedes ajustar esto según tus necesidades
  console.info(data, JSON.stringify(validations));
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  //
  catch(error: Error, host: ExecutionContextHost) {
    const response = host.switchToHttp().getResponse<FastifyReply>();
    console.error('FilterError (****)', error);

    let resp: IResponseDTO<any> = {
      error: true,
      message: 'Error interno del servidor',
      response: null,
      status: 500,
    };

    if (process.env.DEBUG_FRONT === 'true') {
      resp.response = {
        message: error?.message ?? '',
        name: error?.name ?? '',
        error,
        stack: error?.stack ?? '',
      };
    }

    if (error instanceof BadRequestException) {
      resp.message = `Excepción de solicitud incorrecta, ${
        (error.getResponse() as { message?: string }).message
      }`;
      resp.status = 400;
    } else if (error instanceof NotFoundException) {
      resp.message = 'No encontrado';
      resp.status = 404;
    } else if (error instanceof ForbiddenException) {
      resp.message = error.message ?? 'usuario no autorizado para acceder a esta información';
      resp.status = 403;
      printRequestUrl(host, 403);
      resp.response = null;
      error = null;
    } else if (error instanceof UnauthorizedException) {
      resp.message = error.message ?? 'usuario logueado información';
      resp.status = 401;
    } else if (error instanceof UnprocessableEntityException) {
      resp.message = 'Entidad no processable';
      resp.status = 422;
    } else if (error instanceof NotAcceptableError) {
      const respErr = error.getResponse() as IResponseDTO<any>;
      resp.message = respErr.message;
      resp.status = respErr.status;
    } else if (error instanceof ValidatorException) {
      resp = error.getResponse() as IResponseDTO<any>;
      printRequestBodyLog(host, resp.status, resp?.response);
    } else if (error.constructor.toString().includes('class HttpException extends Error')) {
      const respErr = (error as HttpException).getResponse() as IResponseDTO<any>;
      if (typeof respErr?.error !== 'boolean' && typeof respErr?.message !== 'string') {
        if (typeof respErr === 'string') resp.message = respErr;
      } else resp = respErr;
      if (!resp.status || resp.status < 200) resp.status = 400;
      if (error['status'] === 406) resp.status = 406;
    } else if (error instanceof MsSeguridadHttpError) {
      const respErr = error.getResponse() as IResponseDTO<any>;
      if (typeof respErr?.error !== 'boolean' && typeof respErr?.message !== 'string') {
        if (typeof respErr === 'string') resp.message = respErr;
      } else resp = respErr;
      if (!resp.status || resp.status < 200) resp.status = 400;
      printRequestUrl(host, resp.status);
      resp.response = null;
      error = null;
    }

    if (
      process.env.ENV_DEBUG_SERVER === 'true' &&
      error?.message !== 'La sesión no se encuentra activa'
    ) {
      if (![404, 406].includes(resp.status)) {
        // error ? console.error(error) : null;
      }
    }

    response.code(resp.status).send(resp);
  }
}

/* -------------------------------------------------------------------------- */
/*                         excepciones personalizadas                         */
/* -------------------------------------------------------------------------- */

/**
 * servicio para generar una exception http personalizada con un mensaje
 */
export class ValidatorException extends HttpException {
  constructor(message = 'error de validación', status = 406, response = null, error = true) {
    super({ error, message, status, response }, status);
  }
}

/**
 * servicio para generar una exception BadRequestException personalizada con un mensaje
 */
export class ApiBadRequestError extends BadRequestException {
  constructor(message = 'Ocurrió un error', status = 400, response = null, error = true) {
    super({ error, message, status, response });
  }
}

/**
 * servicio para generar una exception BadRequestException personalizada con un mensaje
 */
class NotAcceptableError extends NotAcceptableException {
  constructor(
    message = 'no es posible devolver datos por un error',
    status = 406,
    response = null,
    error = true,
  ) {
    super({ error, message, status, response });
  }
}

/**
 * servicio para generar una exepcion personalizada con un mensaje, UnauthorizedException
 */
export class ApiUnauthorizedError extends UnauthorizedException {
  constructor(
    message = 'usuario no autenticado y/o token no válido',
    response = null,
    status = 401,
    error = true,
  ) {
    super({ error, message, status, response });
  }
}

export class MsSeguridadHttpError extends HttpException {
  constructor(message = 'Ocurrió un error', status = 400, response = null, error = true) {
    super({ error, message, status, response }, status);
  }
}
