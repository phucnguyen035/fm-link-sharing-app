import type { createWorkersKVSessionStorage } from '@remix-run/cloudflare';
import { logDevReady } from '@remix-run/cloudflare';
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';
import * as build from '@remix-run/dev/server-build';
import { createRepository, type Repository } from '~/repo';
import { createSessionStorage } from '~/session.server';

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
			sessions: createSessionStorage(env.SESSIONS, env.SESSION_SECRET),
		};
	},
	mode: build.mode,
});
