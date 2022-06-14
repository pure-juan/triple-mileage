import { Logger } from '@nestjs/common';

export class BaseLogger {
  protected logger: Logger = new Logger(this.constructor.name);
}
