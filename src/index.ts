import { env } from "#env";
import { Logger } from "#functions";
import { dataSource } from "#typeorm";
import { bootstrap } from "@constatic/base";

await dataSource.initialize();
Logger.green('Database initialized!')

await bootstrap({ meta: import.meta, env });