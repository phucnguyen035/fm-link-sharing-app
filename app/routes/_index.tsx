import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData } from '@remix-run/react';

import LoginForm from '~/components/LoginForm';
export function meta() {
	return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];
}

export async function loader({ context }: LoaderFunctionArgs) {
	return json({ users: await context.db.query.users.findMany() });
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const password = formData.get('password')?.toString() ?? '';
	if (!password) {
		return json({ errors: { password: 'Password is required' } });
	}

	return redirect('/');
}

export default function Index() {
	const { users } = useLoaderData<typeof loader>();
	const data = useActionData<typeof action>();

	return (
		<main>
			<Form method="POST">
				<LoginForm errors={data?.errors} />
			</Form>

			<ul>
				{users.map((user) => (
					<li key={user.id}>{user.password}</li>
				))}
			</ul>
		</main>
	);
}
