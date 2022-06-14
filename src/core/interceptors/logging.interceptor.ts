import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { map, Observable, tap } from 'rxjs';
import { pick } from 'src/utils';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  private readonly reqLogger = new Logger(`${LoggingInterceptor.name}.request`);
  private readonly resLogger = new Logger(
    `${LoggingInterceptor.name}.response`,
  );

  intercept(
    ctx: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const start = Date.now();
    const http = ctx.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const response = http.getResponse<FastifyReply>();
    const [method, url] = [request.method, request.url];
    const userAgent = pick(request.headers['user-agent'], 'unknown');
    const requestIp = request.ip;
    const requestBody = request.body;
    let contentLength = 0;

    this.logger.log(`IN <-- ${method} ${url} ${userAgent} ${requestIp}`);

    if (requestBody) {
      try {
        const copy = {
          ...(requestBody as any),
        };
        if (copy.password) delete copy.password;
        this.reqLogger.debug(JSON.stringify(copy, null, 2));
      } catch (e) {
        this.reqLogger.debug(requestBody);
      }
    }

    return next.handle().pipe(
      map((data) => {
        try {
          const res = JSON.stringify(data, null, 2);
          contentLength = res.length;
          this.resLogger.debug(res);
        } catch (e) {
          this.resLogger.debug(data);
        }
        return data;
      }),
      tap(() => {
        this.logger.log(
          `OUT ${method} ${url} ${userAgent} ${requestIp} ${
            response.statusCode
          } ${contentLength} ${Date.now() - start}ms -->`,
        );
      }),
    );
  }
}
