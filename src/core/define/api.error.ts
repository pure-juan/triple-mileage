export type TErrorFormat = {
  status: number;
  msgCode: string;
  msg: string;
};

export class ApiErrorCode {
  readonly status: TErrorFormat['status'];
  readonly msgCode: TErrorFormat['msgCode'];
  readonly msg: TErrorFormat['msg'];

  private constructor({ status, msgCode, msg }: TErrorFormat) {
    this.status = status;
    this.msgCode = msgCode;
    this.msg = msg;
  }

  static from({ status, msgCode, msg }: TErrorFormat): ApiErrorCode {
    return new this({ status, msgCode, msg });
  }
}

export const ApiErrorCodes = {
  COMMON: {
    BAD_REQUEST: ApiErrorCode.from({
      status: 400,
      msgCode: 'api.common.bad_request',
      msg: 'Bad Request',
    }),
    UNAUTHORIZED: ApiErrorCode.from({
      status: 401,
      msgCode: 'api.common.unauthorized',
      msg: 'Unauthorized',
    }),
    FORBIDDEN: ApiErrorCode.from({
      status: 403,
      msgCode: 'api.common.forbidden',
      msg: 'Forbidden',
    }),
    NOT_FOUND: ApiErrorCode.from({
      status: 404,
      msgCode: 'api.common.not_found',
      msg: 'Not Found',
    }),
    METHOD_NOT_ALLOWED: ApiErrorCode.from({
      status: 405,
      msgCode: 'api.common.method_not_allowed',
      msg: 'Method not allowed',
    }),
    NOT_ACCEPTABLE: ApiErrorCode.from({
      status: 406,
      msgCode: 'api.common.not_acceptable',
      msg: 'Not acceptable',
    }),
    REQUEST_TIMEOUT: ApiErrorCode.from({
      status: 408,
      msgCode: 'api.common.request_timeout',
      msg: 'Request timeout',
    }),
    CONFLICT: ApiErrorCode.from({
      status: 409,
      msgCode: 'api.common.conflict',
      msg: 'Conflict',
    }),
    GONE: ApiErrorCode.from({
      status: 410,
      msgCode: 'api.common.gone',
      msg: 'Gone',
    }),
    TOO_MANY_REQUEST: ApiErrorCode.from({
      status: 429,
      msgCode: 'api.common.too_many_request',
      msg: 'Too many request',
    }),

    // 500
    UNKNOWN: ApiErrorCode.from({
      status: 500,
      msgCode: 'api.common.unknown',
      msg: 'UNKNOWN',
    }),
  },
  EVENT: {
    NOT_FOUND: ApiErrorCode.from({
      status: 404,
      msgCode: 'api.event.not_found',
      msg: 'Event not found',
    }),
    ALREADY_EXISTS: ApiErrorCode.from({
      status: 409,
      msgCode: 'api.event.already_exists',
      msg: 'Event already exists',
    }),
  },
  REVIEW: {
    NOT_FOUND: ApiErrorCode.from({
      status: 404,
      msgCode: 'api.review.not_found',
      msg: 'Review not found',
    }),
  },
  MILEAGE: {
    NOT_FOUND: ApiErrorCode.from({
      status: 404,
      msgCode: 'api.mileage.not_found',
      msg: 'Mileage not found',
    }),
  },
} as const;
