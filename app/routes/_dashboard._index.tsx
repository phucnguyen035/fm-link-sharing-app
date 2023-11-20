import { type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { requireUserId } from '~/session.server';

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
	const userId = await requireUserId(request, context.sessions);

	return json({ links: await context.repo.links.get(userId) });
}

export default function Index() {
	const { links } = useLoaderData<typeof loader>();

	return (
		<main>
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
