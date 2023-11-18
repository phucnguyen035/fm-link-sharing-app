import { createCookie, createWorkersKVSessionStorage, logDevReady } from '@remix-run/cloudflare';
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';
import * as build from '@remix-run/dev/server-build';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { drizzle } from 'drizzle-orm/d1';
import { schemas } from '~/schemas';

declare module '@remix-run/cloudflare' {
	interface AppLoadContext {
		db: DrizzleD1Database<typeof schemas>;
		sessions: ReturnType<typeof createWorkersKVSessionStorage<{ userId: number }>>;
	}
}

interface ENV {
	SESSION_SECRET: string;
	DB: D1Database;
	KV_FM_LINK_SHARING: KVNamespace;
}

if (process.env.NODE_ENV === 'development') {
	logDevReady(build);
}

export const onRequest = createPagesFunctionHandler({
	build,
	getLoadContext: (context) => {
		const env = context.env as ENV;
		return {
			env,
			db: drizzle(env.DB, {
				schema: schemas,
				logger: process.env.NODE_ENV === 'development',
			}),
			sessions: createWorkersKVSessionStorage({
				kv: env.KV_FM_LINK_SHARING,
				cookie: createCookie('__session', {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					secrets: [env.SESSION_SECRET],
				}),
			}),
		};
	},
	mode: build.mode,
});
