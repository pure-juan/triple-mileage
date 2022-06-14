export class ApiResponse<T = any> {
  readonly msgCode: string;

  readonly data: T;

  private constructor(data: any, msgCode = 'OK') {
    this.msgCode = msgCode;
    this.data = data;
  }

  static from(data: any, msgCode?: string): ApiResponse {
    return new this(data, msgCode);
  }
}
