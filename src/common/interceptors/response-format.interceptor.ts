import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { FastifyReply } from 'fastify';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const respBackend: FastifyReply = context.switchToHttp().getResponse();
        if (typeof data?.error !== 'boolean') {
          const auxData = {
            error: false,
            message: 'Respuesta exitosa',
            response: {
              data: data,
            },
            status: 200,
          };
          respBackend.code(auxData.status);
          return auxData;
        } else {
          if (typeof data.status == 'number' && data.status > 200) respBackend.code(data.status);
          else if (!data.error) {
            data.status = 200;
            respBackend.code(200);
          } else {
            data.status = 422;
            respBackend.code(422);
          }
          return data;
        }
      }),
    );
  }
}
