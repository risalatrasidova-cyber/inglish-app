import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config();

const dbType = (process.env.DB_TYPE as any) || 'postgres';

const dataSourceConfig: any = {
  type: dbType,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../migrations/**/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

if (dbType === 'sqlite') {
  // Тот же путь, что и в app: относительно текущей папки (запускай команды из backend!)
  dataSourceConfig.database = join(process.cwd(), process.env.DB_DATABASE || 'inglish_app.db');
} else {
  dataSourceConfig.host = process.env.DB_HOST || 'localhost';
  dataSourceConfig.port = parseInt(process.env.DB_PORT) || 5432;
  dataSourceConfig.username = process.env.DB_USERNAME || 'postgres';
  dataSourceConfig.password = process.env.DB_PASSWORD || 'postgres';
  dataSourceConfig.database = process.env.DB_DATABASE || 'inglish_app';
}

export const AppDataSource = new DataSource(dataSourceConfig);

