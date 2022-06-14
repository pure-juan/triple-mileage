import {
  ArgumentsHost,
  BadRequestException,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  GoneException,
  Injectable,
  MethodNotAllowedException,
  NotAcceptableException,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { BaseLogger } from 'src/utils/log.base';
import { ApiErrorCodes } from '../define/api.error';
import { ApiException } from '../exception/api.exception';
import { ApiErrorResponse } from '../response/api.error.response';

@Injectable()
export class FallbackExceptionFilter
  extends BaseLogger
  implements ExceptionFilter
{
  private FORBIDDEN = ApiException.from(ApiErrorCodes.COMMON.FORBIDDEN);
  private NOT_FOUND = ApiException.from(ApiErrorCodes.COMMON.NOT_FOUND);
  private METHOD_NOT_ALLOWED = ApiException.from(
    ApiErrorCodes.COMMON.METHOD_NOT_ALLOWED,
  );
  private NOT_ACCEPTABLE = ApiException.from(
    ApiErrorCodes.COMMON.NOT_ACCEPTABLE,
  );
  private REQUEST_TIMEOUT = ApiException.from(
    ApiErrorCodes.COMMON.REQUEST_TIMEOUT,
  );
  private CONFLICT = ApiException.from(ApiErrorCodes.COMMON.CONFLICT);
  private GONE = ApiException.from(ApiErrorCodes.COMMON.GONE);
  private UNKNOWN = ApiException.from(ApiErrorCodes.COMMON.UNKNOWN);

  catch<T extends Error>(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<FastifyReply>();

    let result: ApiException;

    if (exception instanceof ApiException) {
      result = exception;
    } else if (exception instanceof BadRequestException) {
      let errors = [];
      const errRes = exception.getResponse();
      if (this.#isBadRequest(errRes)) {
        errors = errRes.message;
      }
      result = ApiException.from(ApiErrorCodes.COMMON.BAD_REQUEST, errors);
    } else if (exception instanceof ForbiddenException) {
      result = this.FORBIDDEN;
    } else if (exception instanceof NotFoundException) {
      result = this.NOT_FOUND;
    } else if (exception instanceof MethodNotAllowedException) {
      result = this.METHOD_NOT_ALLOWED;
    } else if (exception instanceof NotAcceptableException) {
      result = this.NOT_ACCEPTABLE;
    } else if (exception instanceof ConflictException) {
      result = this.CONFLICT;
    } else if (exception instanceof RequestTimeoutException) {
      result = this.REQUEST_TIMEOUT;
    } else if (exception instanceof GoneException) {
      result = this.GONE;
    } else {
      this.logger.error(exception.stack);
      result = this.UNKNOWN;
    }

    res.status(result.status).send(ApiErrorResponse.from(result));
  }

  #isBadRequest(res: any): res is { message: string[] } {
    return !!res?.message;
  }
}
