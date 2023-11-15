import { logDevReady } from "@remix-run/cloudflare";
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";
import { createDb } from "~/db.server";

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    db: ReturnType<typeof createDb>;
  }
}

if (process.env.NODE_ENV === "development") {
  logDevReady(build);
}

export const onRequest = createPagesFunctionHandler({
  build,
  getLoadContext: (context) => ({
    env: context.env,
    db: createDb(context.env.DB),
  }),
  mode: build.mode,
});
