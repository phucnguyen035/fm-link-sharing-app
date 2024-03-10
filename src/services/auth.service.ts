import "server-only";
import { db, schema } from "@/db";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";

const adapter = new DrizzlePostgreSQLAdapter(db, schema.sessions, schema.users);

const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
    };
  }
}

export async function login(userId: string) {
  const session = await lucia.createSession(userId, {});
  return lucia.createSessionCookie(session.id);
}

export async function logout(sessionId: string) {
  return await lucia.invalidateSession(sessionId);
}
