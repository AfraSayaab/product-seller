import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: "mysql://superuser:superuser%40123@104.198.145.135:3306/dazzleandbloom",
  },
});
