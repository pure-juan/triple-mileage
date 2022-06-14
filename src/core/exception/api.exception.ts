import { ApiErrorCode, TErrorFormat } from '../define/api.error';

export class ApiException extends Error {
  readonly status: TErrorFormat['status'];
  readonly msgCode: TErrorFormat['msgCode'];
  readonly msg: TErrorFormat['msg'];
  readonly errors: Array<string> = [];

  constructor(code: ApiErrorCode, errors: Array<string> = []) {
    super(code.msg);
    this.status = code.status;
    this.msgCode = code.msgCode;
    this.msg = code.msg;
    this.errors = errors;
  }

  static from(code: ApiErrorCode, errors: Array<string> = []): ApiException {
    return new this(code, errors);
  }
}
