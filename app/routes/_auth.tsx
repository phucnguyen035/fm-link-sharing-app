import { redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Outlet } from '@remix-run/react';

export async function loader({ request, context }: LoaderFunctionArgs) {
	const session = await context.sessions.getSession(request.headers.get('Cookie'));
	if (session.has('userId')) {
		return redirect('/');
	}

	return null;
}

export default function AuthLayout() {
	return (
		<main className="grid h-screen place-items-center md:bg-muted">
			<div className="w-full max-w-md">
				<Outlet />
			</div>
		</main>
	);
}
