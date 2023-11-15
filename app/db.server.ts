import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { schemas } from "./schemas";

let db: DrizzleD1Database<typeof schemas>;

export function createDb(d1: D1Database) {
  if (process.env.NODE_ENV !== "production") {
    if (!db) {
      db = drizzle(d1, {
        schema: schemas,
        logger: true,
      });
    }

    return db;
  }

  return drizzle(d1, {
    schema: schemas,
    logger: true,
  });
}
