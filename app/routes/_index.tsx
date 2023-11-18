import { type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';

export function meta() {
	return [
		{ title: 'Link Sharing App [FM]' },
		{
			name: 'description',
			content: 'Welcome to Link Sharing App, a project from Frontend Mentor!',
		},
	];
}

export async function loader({ context, request }: LoaderFunctionArgs) {
	const session = await context.sessions.getSession(request.headers.get('Cookie'));
	if (!session.has('userId')) {
		return redirect('/login');
	}

	return json({ users: await context.db.query.users.findMany() });
}

export default function Index() {
	const { users } = useLoaderData<typeof loader>();

	return (
		<main>
			<ul>
				{users.map((user) => (
					<li key={user.id}>{user.password}</li>
				))}
			</ul>
		</main>
	);
}
