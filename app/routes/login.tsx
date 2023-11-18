import { Form, Link, useActionData } from '@remix-run/react';
import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { createSession, json, redirect } from '@remix-run/cloudflare';
import { compare } from 'bcryptjs';
import { LockIcon, MailIcon } from 'lucide-react';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export function meta() {
	return [{ title: 'Login' }, { name: 'description', content: 'Login to Link Sharing App' }];
}

export async function loader({ context, request }: LoaderFunctionArgs) {
	const session = await context.sessions.getSession(request.headers.get('Cookie'));

	if (session.id) {
		return redirect('/');
	}

	return null;
}

export async function action({ request, context }: ActionFunctionArgs) {
	let userId = 0;
	const { db, sessions } = context;
	const formData = await request.formData();
	const schema = z
		.object({
			email: z.string().email(),
			password: z.string(),
		})
		.refine(async ({ email, password }) => {
			const user = await db.query.users.findFirst({
				columns: { id: true, password: true },
				where: (users, { eq }) => eq(users.email, email),
			});
			if (!user) {
				return false;
			}

			const isPasswordValid = await compare(password, user.password);
			if (!isPasswordValid) {
				return false;
			}

			userId = user.id;

			return true;
		}, 'Unable to login');

	const result = await schema.spa(Object.fromEntries(formData));
	if (!result.success) {
		return json({ errors: result.error.flatten() }, { status: 400 });
	}

	if (!userId) {
		throw new Error(`Unable to assign user id`);
	}

	const session = createSession({ userId });

	return redirect('/', {
		headers: {
			'set-cookie': await sessions.commitSession(session),
		},
	});
}

export default function LoginPage() {
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
							Login
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
		</main>
	);
}
