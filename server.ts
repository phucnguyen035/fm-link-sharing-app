import { createCookie, createWorkersKVSessionStorage, logDevReady } from '@remix-run/cloudflare';
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';
import * as build from '@remix-run/dev/server-build';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '~/schemas';

declare module '@remix-run/cloudflare' {
	interface AppLoadContext {
		db: DrizzleD1Database<typeof schema>;
		sessions: ReturnType<typeof createWorkersKVSessionStorage<{ userId: number }>>;
	}
}

interface ENV {
	SESSION_SECRET: string;
	DB: D1Database;
	SESSIONS: KVNamespace;
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
				schema,
				logger: process.env.NODE_ENV === 'development',
			}),
			sessions: createWorkersKVSessionStorage({
				kv: env.SESSIONS,
				cookie: createCookie('__session', {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					secrets: [env.SESSION_SECRET],
					expires: getFutureDate(7),
				}),
			}),
		};
	},
	mode: build.mode,
});

function getFutureDate(days: number) {
	return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
