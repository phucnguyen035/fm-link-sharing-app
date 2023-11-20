import { redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Outlet } from '@remix-run/react';
import Logo from '~/components/Logo';
import { getUserId } from '~/session.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
	const userId = await getUserId(request, context.sessions);
	if (userId) {
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
