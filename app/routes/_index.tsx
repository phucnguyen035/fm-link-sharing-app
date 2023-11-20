import { type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import Logo from '~/components/Logo';
import LogoIcon from '~/components/LogoIcon';

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
	const userId = session.get('userId');
	if (!userId) {
		return redirect('/login');
	}

	const links = await context.db.query.links.findMany({
		columns: {
			type: true,
			id: true,
			url: true,
		},
		where: (links, { eq }) => eq(links.userId, userId),
	});

	return json({ links });
}

export default function Index() {
	const { links } = useLoaderData<typeof loader>();

	return (
		<main>
			<div className="flex">
				<Logo className="hidden md:inline" />
				<LogoIcon className="inline md:hidden" />
			</div>

			{links.length > 0 ? (
				<ul>
					{links.map((link) => (
						<li key={link.id}>
							<a href={link.url}>{link.type}</a>
						</li>
					))}
				</ul>
			) : (
				<p>No links yet.</p>
			)}
		</main>
	);
}
