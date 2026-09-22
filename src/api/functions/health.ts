import { createServerFn } from "@tanstack/react-start";
import { checkDatabaseHealth } from "../db/mongodb";

export const getDatabaseHealthServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return await checkDatabaseHealth();
  }
);
