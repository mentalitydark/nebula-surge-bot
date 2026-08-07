import 'dotenv/config';
import { z as Zod } from "zod";

const schema = Zod.object({
  NODE_ENV: Zod.enum(["development", "production", "test"]).default("development"),
  BOT_TOKEN: Zod.string().min(1),
  GUILD_ID: Zod.string().min(1),
})

const _env = schema.safeParse(process.env);

if (_env.success === false) {
  console.error("Invalid environment variables", Zod.treeifyError(_env.error));

  throw new Error("Invalid environment variables");
}

export const env = _env.data;