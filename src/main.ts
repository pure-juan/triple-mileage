import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const logger = new Logger('main');
  await app.listen(3000, '0.0.0.0', (err, address) => {
    if (err) {
      console.error(err);
    }

    logger.log(`Server is listening at ${address}`);
  });
}
bootstrap();
