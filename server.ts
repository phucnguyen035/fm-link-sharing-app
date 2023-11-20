import { createCookie, createWorkersKVSessionStorage, logDevReady } from '@remix-run/cloudflare';
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';
import * as build from '@remix-run/dev/server-build';
import { createRepository, type Repository } from '~/repo';

declare module '@remix-run/cloudflare' {
	interface AppLoadContext {
		repo: Repository;
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
			repo: createRepository(env.DB),
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
