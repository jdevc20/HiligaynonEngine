import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("postgresql://hilitech_auth_db_user:3f3HxXJ3Xc3n4WuVOoQYbOgIqUpwVbDd@dpg-d84645jtqb8s73f2896g-a/hilitech_auth_db"),
  },
});