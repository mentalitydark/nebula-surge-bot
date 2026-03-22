import { env } from "#env";
import { DataSource } from "typeorm";

const __dirname = new URL(".", import.meta.url).pathname;

export const dataSource = new DataSource({
  type: 'sqlite',
  database: env.DATABASE_NAME,
  synchronize: false,
  logging: env.NODE_ENV !== 'production' ? true : false,
  migrationsRun: true,
  entities: [__dirname+'../../**/entities/*{.js,.ts}'],
  migrations: [__dirname+'migrations/*{.js,.ts}'],
})