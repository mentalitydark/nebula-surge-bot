import { env } from "#env";
import { DataSource } from "typeorm";
import { Builds } from "./entities/Builds.js";

const __dirname = new URL(".", import.meta.url).pathname;

export const dataSource = new DataSource({
  type: 'sqlite',
  database: env.DATABASE_NAME,
  synchronize: false,
  logging: env.NODE_ENV === 'development' ? true : false,
  migrationsRun: true,
  entities: [__dirname + "/entities/{*.ts,*.js}"],
  migrations: [__dirname + "/migrations/{*.ts,*.js}"],
})

export const entities = {
  Builds
}