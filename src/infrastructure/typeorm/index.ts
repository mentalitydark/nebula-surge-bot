import { env } from "#env";
import { DataSource } from "typeorm";

export const dataSource = new DataSource({
  type: 'sqlite',
  database: env.DATABASE_NAME,
  synchronize: false,
  logging: env.NODE_ENV === 'development' ? true : false,
  migrationsRun: true,
  entities: ["src/**/entities/**/{*.ts,*.js}"],
  migrations: ["src/**/migrations/**/{*.ts,*.js}"],
})