import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const CONFIG = 'CONFIG';

export interface AppConfigDatabase {
  driver: string;
  url: string;
  username: string;
  password: string;
}

export interface AppConfig {
  database: AppConfigDatabase;
}

export const configProvider = {
  provide: CONFIG,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): AppConfig => ({
    database: {
      driver: configService.get<string>('DATABASE_DRIVER', 'postgres'),
      url: configService.get<string>(
        'DATABASE_URL',
        'postgres://localhost:5432/films',
      ),
      username: configService.get<string>('DATABASE_USERNAME', 'postgres'),
      password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
    },
  }),
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [configProvider],
  exports: [configProvider],
})
export class AppConfigModule {}
