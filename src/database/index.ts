import { env } from "#env";
import { DataSource } from "typeorm";

const __dirname = new URL(".", import.meta.url).pathname;

export const dataSource = new DataSource({
  type: 'sqlite',
  database: env.DATABASE_NAME,
  synchronize: false,
  logging: true,
  migrationsRun: true,
  entities: [__dirname + "/entities/{*.ts,*.js}"],
  migrations: [__dirname + "/migrations/{*.ts,*.js}"],
})