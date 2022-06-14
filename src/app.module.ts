import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TDatabaseConfig } from './config';
import { FallbackExceptionFilter } from './core/filters';
import { LoggingInterceptor, TransformInterceptor } from './core/interceptors';
import { EventModule } from './event/event.module';
import { MileageModule } from './mileage/mileage.module';
import { StatusController } from './status.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<TDatabaseConfig>) => {
        const [host, port, username, password, database] = [
          configService.get<string>('database.host'),
          parseInt(configService.get<string>('database.port', '3306'), 10),
          configService.get<string>('database.username'),
          configService.get<string>('database.password'),
          configService.get<string>('database.database'),
        ];
        return {
          type: 'mysql',
          host,
          port,
          username,
          password,
          database,
          charset: 'utf8mb4_general_ci',
          entities: ['dist/**/*.entity.{ts,js}'],
          autoLoadEntities: true,
          synchronize: false,
        };
      },
      inject: [ConfigService],
    }),

    EventModule,
    MileageModule,
  ],
  controllers: [StatusController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ transform: true }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: FallbackExceptionFilter,
    },
  ],
})
export class AppModule {}
