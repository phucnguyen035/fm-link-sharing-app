import { redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Outlet } from '@remix-run/react';
import Logo from '~/components/Logo';

export async function loader({ request, context }: LoaderFunctionArgs) {
	const session = await context.sessions.getSession(request.headers.get('Cookie'));
	if (session.has('userId')) {
		return redirect('/');
	}

	return null;
}

export default function AuthLayout() {
	return (
		<main className="grid h-screen place-items-center">
			<div className="grid w-full max-w-md gap-y-12">
				<div className="flex justify-center">
					<Logo />
				</div>
				<Outlet />
			</div>
		</main>
	);
}
