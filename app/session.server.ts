import { createCookie, createWorkersKVSessionStorage, redirect } from '@remix-run/cloudflare';

export function createSessionStorage(kv: KVNamespace, secret: string) {
	function getFutureDate(days: number) {
		return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
	}

	return createWorkersKVSessionStorage<{ userId: number }>({
		kv,
		cookie: createCookie('__session', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			secrets: [secret],
			expires: getFutureDate(1),
		}),
	});
}

type SessionStorage = ReturnType<typeof createSessionStorage>;

export async function getUserId(request: Request, { getSession }: SessionStorage) {
	const session = await getSession(request.headers.get('Cookie'));
	const userId = session.get('userId');
	return userId;
}

export async function requireUserId(
	request: Request,
	sessionStorage: SessionStorage,
	redirectTo: string = new URL(request.url).pathname,
) {
	const userId = await getUserId(request, sessionStorage);
	if (!userId) {
		const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
		throw redirect(`/login?${searchParams}`);
	}

	return userId;
}
