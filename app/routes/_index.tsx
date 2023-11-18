import { json, redirect } from '@remix-run/cloudflare';
import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import { hash } from 'bcryptjs';
import { LockIcon, MailIcon } from 'lucide-react';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { users } from '~/schemas/users';

const MIN_PASSWORD_LENGTH = 8;

export function meta() {
	return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];
}

export async function loader({ context }: LoaderFunctionArgs) {
	return json({ users: await context.db.query.users.findMany() });
}

export async function action({ request, context }: ActionFunctionArgs) {
	const formData = await request.formData();
	const schema = z
		.object({
			email: z.string().email(),
			password: z.string().min(MIN_PASSWORD_LENGTH),
		})
		.refine(async ({ email }) => {
			const user = await context.db.query.users.findFirst({
				columns: { id: true },
				where: (users, { eq }) => eq(users.email, email),
			});

			return !user;
		}, 'Failed to sign up');

	const result = await schema.spa(Object.fromEntries(formData));
	if (!result.success) {
		return json({ errors: result.error.flatten() }, { status: 400 });
	}

	const hashedPassword = await hash(result.data.password, 8);
	await context.db.insert(users).values({
		email: result.data.email,
		password: hashedPassword,
	});

	return redirect('/');
}

export default function Index() {
	const { users } = useLoaderData<typeof loader>();
	const data = useActionData<typeof action>();

	return (
		<main>
			<Form method="POST">
				<Card className="mx-auto max-w-md rounded-sm">
					<CardHeader>
						<CardTitle>Login</CardTitle>
						<CardDescription>Add your details below to get back into the app</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-y-4">
						<div>
							<Label htmlFor="email">Email address</Label>
							<Input
								required
								id="email"
								type="email"
								placeholder="e.g. alex@email.com"
								name="email"
								icon={<MailIcon className="h-4 w-4 text-muted-foreground" />}
								error={data?.errors.fieldErrors.email || data?.errors.formErrors}
							/>
							{data?.errors.fieldErrors.email && (
								<span className="text-xs text-destructive">{data.errors.fieldErrors.email[0]}</span>
							)}
						</div>
						<div>
							<Label htmlFor="password">Password</Label>
							<Input
								required
								minLength={MIN_PASSWORD_LENGTH}
								id="password"
								type="password"
								placeholder="Enter your password"
								name="password"
								icon={<LockIcon className="h-4 w-4 text-muted-foreground" />}
								error={data?.errors.fieldErrors.password || data?.errors.formErrors}
							/>
							{data?.errors.fieldErrors.password && (
								<span className="text-xs text-destructive">
									{data.errors.fieldErrors.password?.[0]}
								</span>
							)}
						</div>
						{data?.errors.formErrors && (
							<span className="text-xs text-destructive">{data.errors.formErrors[0]}</span>
						)}
						<Button type="submit" className="w-full">
							Sign up
						</Button>
						<p className="text-center">
							Don't have an account?{' '}
							<Link to="/register" className="text-primary">
								Create account
							</Link>
						</p>
					</CardContent>
				</Card>
			</Form>

			<ul>
				{users.map((user) => (
					<li key={user.id}>{user.password}</li>
				))}
			</ul>
		</main>
	);
}
