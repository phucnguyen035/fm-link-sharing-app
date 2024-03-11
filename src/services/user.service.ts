"use server";
import { db, schema } from "@/db";
import { Argon2id } from "oslo/password";

const argon2id = new Argon2id();

export async function getUserByEmail(email: string) {
  return await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
    columns: {
      password: false,
    },
  });
}

export async function hasExistingUser(email: string) {
  const user = await getUserByEmail(email);
  return !!user;
}

export async function createUser(email: string, password: string) {
  const hashedPassword = await argon2id.hash(password);

  const [{ id }] = await db
    .insert(schema.users)
    .values({ email, password: hashedPassword })
    .returning({ id: schema.users.id });

  return id;
}
