import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: process.env.DB_TYPE === 'mysql' ? 'mysql' : 'sqlite',
  port: parseInt(process.env.DB_PORT, 10) ?? 3306,
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  autoLoadEntities: process.env.DB_AUTOLOADENTITIES === 'true',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  keepConnectionAlive: process.env.DB_KEEP_CONNECTION_ALIVE === 'true',
  logging: process.env.DB_LOGGING === 'true' ? true : process.env.DB_LOGGING,
  charset: process.env.DB_CHARSET ?? 'utf8mb4_general_ci',
}));
