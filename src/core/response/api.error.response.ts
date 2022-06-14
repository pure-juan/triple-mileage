import { ApiException } from '../exception/api.exception';

export class ApiErrorResponse {
  readonly msgCode: string;
  readonly msg: string;
  readonly errors: Array<string> = [];

  private constructor(
    msgCode: string,
    msg: string,
    errors: Array<string> = [],
  ) {
    this.msgCode = msgCode;
    this.msg = msg;
    this.errors = errors;
  }

  static from(exception: ApiException): ApiErrorResponse {
    return new this(exception.msgCode, exception.msg, exception.errors);
  }
}
